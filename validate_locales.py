import argparse
import json
import os
import re
import sys
from collections import defaultdict

# Configuration
LOCALES_DIR = 'src/locales'
SRC_DIR = 'src'
LANGUAGES = ['en', 'es']
SOURCE_FILE_EXTENSIONS = ('.ts', '.tsx', '.js', '.jsx')

def flatten_json(y):
    """
    Flattens a nested JSON object into a dictionary with dot-separated keys.
    """
    out = {}

    def flatten(x, name=''):
        if type(x) is dict:
            for a in x:
                flatten(x[a], name + a + '.')
        else:
            out[name[:-1]] = x

    flatten(y)
    return out

def load_keys(lang):
    """
    Loads keys from the translation file for a given language.
    """
    file_path = os.path.join(LOCALES_DIR, lang, 'translation.json')
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            return set(flatten_json(data).keys())
    except FileNotFoundError:
        print(f"Error: File not found {file_path}")
        sys.exit(1)
    except json.JSONDecodeError:
        print(f"Error: Invalid JSON in {file_path}")
        sys.exit(1)

def get_all_source_files():
    """
    Recursively finds all source files in the SRC_DIR.
    """
    source_files = []
    for root, _, files in os.walk(SRC_DIR):
        for file in files:
            if file.endswith(SOURCE_FILE_EXTENSIONS):
                source_files.append(os.path.join(root, file))
    return source_files

def check_keys_usage(keys, source_files):
    """
    Checks if keys are used in the source files.
    Returns:
       unused_keys: set of keys not found
       usage_stats: dict { key: { filepath: count } }
    """
    # Regex to find quoted strings with matching start/end quotes: 'key' or "key"
    # Matches: group 1 (quote), group 2 (content), backreference to group 1
    pattern = re.compile(r"(['\"])(.*?)\1")
    
    usage_stats = defaultdict(lambda: defaultdict(int))
    
    for file_path in source_files:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                # findall returns list of tuples (quote, content)
                matches = [m[1] for m in pattern.findall(content)]
                
                for match in matches:
                    # We only care if the match is one of our known keys
                    if match in keys:
                        usage_stats[match][file_path] += 1
        except Exception as e:
            print(f"Warning: Could not read {file_path}: {e}")

    used_keys = set(usage_stats.keys())
    unused_keys = keys - used_keys
            
    return unused_keys, usage_stats

def main():
    parser = argparse.ArgumentParser(description="Validate i18n locales files.")
    parser.add_argument('--show-usage', action='store_true', help="Show detailed usage of keys in source files")
    args = parser.parse_args()

    print("--- Validating i18n files ---\n")
    
    # 1. Load keys
    keys_by_lang = {}
    for lang in LANGUAGES:
        keys_by_lang[lang] = load_keys(lang)
        print(f"Loaded {len(keys_by_lang[lang])} keys for '{lang}'")

    # 2. Validate consistency (symmetry)
    all_keys = set().union(*keys_by_lang.values())
    has_errors = False

    print("\n--- Checking Consistency ---")
    for lang in LANGUAGES:
        missing_keys = all_keys - keys_by_lang[lang]
        if missing_keys:
            has_errors = True
            print(f"\nMissing keys in '{lang}':")
            for key in sorted(missing_keys):
                print(f"  - {key}")
        else:
            print(f"OK: '{lang}' has all keys.")

    # 3. Validate usage
    print("\n--- Checking Usage ---")
    source_files = get_all_source_files()
    unused_keys, usage_stats = check_keys_usage(all_keys, source_files)
    
    if unused_keys:
        has_errors = True
        print(f"\nPotential unused keys ({len(unused_keys)}):")
        for key in sorted(unused_keys):
            print(f"  ? {key}")
    else:
        print("OK: All keys identified in t(...) calls.")

    if args.show_usage:
        print("\n--- Detailed Usage Report ---")
        if not usage_stats:
            print("No usages found.")
        else:
            for key in sorted(usage_stats.keys()):
                print(f"Key: {key}")
                total_uses = 0
                for file_path, count in usage_stats[key].items():
                    # Print relative path for cleaner output
                    rel_path = os.path.relpath(file_path, os.getcwd())
                    print(f"  - {rel_path} ({count})")
                    total_uses += count
                print(f"  (Total: {total_uses})")

    if has_errors:
        print("\nValidation failed with issues found.")
        sys.exit(1)
    else:
        print("\nValidation successful!")
        sys.exit(0)

if __name__ == "__main__":
    main()
