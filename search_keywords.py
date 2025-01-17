import os

# List of extensions for text-based files
text_extensions = [
    '.txt', '.py', '.md', '.json', '.yaml', '.yml', '.csv', '.xml', '.html', '.css', '.js', '.java', '.cpp', '.c', '.h', '.cs'
]

def search_repository(directory, keywords, exclude_file):
    """
    Search through text-based files in the specified directory for the given keywords, excluding the script itself.

    Args:
        directory (str): The root directory to search.
        keywords (list of str): List of keywords to search for.
        exclude_file (str): The file to exclude from the search (e.g., this script).

    Returns:
        None
    """
    for root, _, files in os.walk(directory):
        for file in files:
            file_path = os.path.join(root, file)
            # Skip non-text files and the script itself
            if not any(file.endswith(ext) for ext in text_extensions) or file_path == exclude_file:
                continue

            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    for line_number, line in enumerate(f, start=1):
                        for keyword in keywords:
                            if keyword in line:
                                print(f"Keyword '{keyword}' found in {file_path} on line {line_number}: {line.strip()}")
            except (UnicodeDecodeError, PermissionError) as e:
                # Skip files that can't be read
                print(f"Could not read {file_path}: {e}")

if __name__ == "__main__":
    # Specify the root directory of your repository
    root_directory = "./"

    # Get the path of this script to exclude it
    current_script = os.path.abspath(__file__)

    # Enter the keywords to search for
    keywords = input("Enter keywords to search for (comma-separated): ").split(',')
    keywords = [kw.strip() for kw in keywords]  # Remove extra spaces

    print("\nSearching repository for text-based files...\n")
    search_repository(root_directory, keywords, current_script)
