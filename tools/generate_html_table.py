#!/usr/bin/env python3
"""
Generate HTML documentation from JSON schema files.

This script processes JSON schema files representing game protocol packets
and creates individual HTML pages for each packet, plus an index page.

Features:
- Displays x-underlying-type instead of generic types
- Handles oneOf unions as tables
- Sorts fields by ordinal index
- Creates nested tables for complex types
- Generates separate HTML files per packet

Usage:
    python generate_html_table.py [input_path] [output_path]
    
    input_path: Optional path to directory containing JSON files (default: script directory)
    output_path: Optional path to output directory (default: ./docs in script directory)
"""

import json
import sys
from pathlib import Path
from typing import Any, Dict, List, Tuple
from html import escape


class PacketDocGenerator:
    """Generates HTML documentation for game protocol packets."""
    
    def __init__(self, output_dir: Path, source_dir: Path):
        """Initialize the generator with an output directory."""
        self.output_dir = output_dir
        self.output_dir.mkdir(exist_ok=True)
        self.source_dir = source_dir
        self.enum_cache = {}
        self._load_enums()
    
    def _load_enums(self):
        """Load all enum definitions from enum_*.json files."""
        enum_files = self.source_dir.glob("enum_*.json")
        for enum_file in enum_files:
            try:
                with open(enum_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    title = data.get('title', '')
                    if title and 'enum' in data:
                        self.enum_cache[title] = data['enum']
            except Exception as e:
                print(f"Warning: Could not load enum from {enum_file}: {e}")
    
    @staticmethod
    def get_underlying_type(field_data: Dict[str, Any], definitions: Dict[str, Any]) -> str:
        """
        Extract the underlying type from field data.
        
        Prioritizes x-underlying-type over standard type field.
        Handles arrays, references, enums, and oneOf unions.
        For enums: uses x-underlying-type only if "Enum-as-Value" is in serialization options,
        otherwise falls back to the regular type.
        """

        serialization_options = None
        if 'x-serialization-options' in field_data:
            serialization_options = field_data['x-serialization-options']

        # Check for x-underlying-type first (preferred)
        if 'x-underlying-type' in field_data:
            # For enums, only use x-underlying-type if "Enum-as-Value" is present
            if 'enum' in field_data:
                if serialization_options and 'Enum-as-Value' in serialization_options:
                    if 'Compression' in serialization_options:
                        return 'var'+ field_data['x-underlying-type']
                    
                    return field_data['x-underlying-type']
                # Fall back to regular type for enums without Enum-as-Value
                return field_data.get('type', 'unknown')
            
            # For non-enums, handle compression
            if serialization_options:
                if 'Compression' in serialization_options:
                    return 'var'+ field_data['x-underlying-type']

            return field_data['x-underlying-type']
        
        # Check if it's an array
        if field_data.get('type') == 'array':
            items = field_data.get('items', {})
            if '$ref' in items:
                ref_id = items['$ref'].split('/')[-1]
                if (definitions and ref_id in definitions):
                    ref_schema = definitions[ref_id]
                    ref_title = ref_schema.get('title', ref_id)
                    return  f"array&lt;{ref_title}&gt;"

                return f"array&lt;{ref_id}&gt;"
            elif 'x-underlying-type' in items:
                return f"array&lt;{items['x-underlying-type']}&gt;"
            else:
                item_type = items.get('type', 'unknown')
                return f"array&lt;{item_type}&gt;"
        
        # Check for oneOf (union types)
        if 'oneOf' in field_data:
            return 'oneOf'
        
        # Check for $ref
        if '$ref' in field_data:
            ref_id = field_data['$ref'].split('/')[-1]
            # Try to resolve the ref to get the title
            if definitions and ref_id in definitions:
                ref_schema = definitions[ref_id]
                return ref_schema.get('title', ref_id)
            return ref_id
        
        # Check for enum
        if 'enum' in field_data:
            return field_data.get('title', 'enum')
        
        # Check for additionalProperties
        if field_data.get('type') == 'object' and 'additionalProperties' in field_data:
            additional_props = field_data['additionalProperties']
            if additional_props.get('type') == 'object' and 'properties' in additional_props:
                props = additional_props['properties']
                key_type = 'string'
                value_type = 'object'
                if 'key' in props:
                    key_type = PacketDocGenerator.get_underlying_type(props['key'], definitions)
                if 'value' in props:
                    value_type = PacketDocGenerator.get_underlying_type(props['value'], definitions)
                return f"object&lt;{key_type}, {value_type}&gt;"
            else:
                value_type = PacketDocGenerator.get_underlying_type(additional_props, definitions)
                return f"object&lt;string, {value_type}&gt;"
        
        # Fallback to basic type
        return field_data.get('type', 'unknown')
    
    @staticmethod
    def get_ordinal_index(field_data: Dict[str, Any]) -> int:
        """Get the ordinal index, defaulting to high value if not present."""
        return field_data.get('x-ordinal-index', 9999)
    
    def generate_enum_table(self, enum_values: List[str], indent_level: int) -> str:
        """Generate a table displaying enum values."""
        if not enum_values:
            return ""
        
        margin_left = (indent_level + 1) * 20
        html = []
        
        html.append(f'<div style="margin-left: {margin_left}px; margin-top: 5px; margin-bottom: 5px;">')
        html.append('<strong>Enum Values:</strong>')
        html.append('<table border="1" cellpadding="3" cellspacing="0" style="border-collapse: collapse; width: 100%; max-width: 760px; font-size: 12px;">')
        html.append('<thead>')
        html.append('<tr style="background-color: #e8e8e8;">')
        html.append('<th style="width: 40px;">Index</th>')
        html.append('<th>Value</th>')
        html.append('</tr>')
        html.append('</thead>')
        html.append('<tbody>')
        
        for idx, value in enumerate(enum_values):
            html.append('<tr>')
            html.append(f'<td style="text-align: center;">{idx}</td>')
            html.append(f'<td><code>{escape(value)}</code></td>')
            html.append('</tr>')
        
        html.append('</tbody>')
        html.append('</table>')
        html.append('</div>')
        
        return '\n'.join(html)
    
    def generate_oneof_table(self, field_data: Dict[str, Any], indent_level: int, definitions: Dict[str, Any]) -> str:
        """Generate a table displaying oneOf union types with expanded definitions."""
        if 'oneOf' not in field_data:
            return ""
        
        # Get control value type from field data, default to varuint32
        control_value_type = field_data.get('x-control-value-type', 'varuint32')
        
        oneof_type = 'oneOf<'
        one_of_members_html = []
        expanded_definitions_html = []
        
        for idx, one_of_item in enumerate(field_data['oneOf'], 0):
            underlying_type = self.get_underlying_type(one_of_item, definitions)
            oneof_type += underlying_type + ', '
            
            # Get any additional details
            details = []
            if 'x-underlying-type' in one_of_item:
                details.append(f"Underlying: {one_of_item['x-underlying-type']}")
            if 'x-serialization-options' in one_of_item:
                details.append(f"Serialization: {one_of_item['x-serialization-options']}")
            if 'title' in one_of_item:
                details.append(f"Title: {one_of_item['title']}")
            
            details_str = ', '.join(details) if details else '-'
            
            one_of_members_html.append('<tr>')
            one_of_members_html.append(f'<td>{idx}</td>')
            one_of_members_html.append(f'<td><strong>{underlying_type}</strong></td>')
            one_of_members_html.append(f'<td>{details_str}</td>')
            one_of_members_html.append('</tr>')
            
            # Try to expand the definition if it's a $ref
            if '$ref' in one_of_item:
                ref_id = one_of_item['$ref'].split('/')[-1]
                if ref_id in definitions:
                    ref_schema = definitions[ref_id]
                    ref_title = ref_schema.get('title', ref_id)
                    
                    # Skip if title ends with "Payload"
                    if not ref_title.endswith('Payload'):
                        nested_html = self.generate_nested_table(
                            ref_schema, 
                            definitions, 
                            "", 
                            indent_level + 2  # Extra indent for oneOf variants
                        )
                        if nested_html:
                            # Wrap in details element for collapsible display
                            detail_html = []
                            detail_html.append(f'<details style="margin-left: {(indent_level + 1) * 20}px; margin-top: 10px;">')
                            detail_html.append(f'<summary style="cursor: pointer; font-weight: bold; padding: 5px; background-color: #f0f0f0; border: 1px solid #ddd;"><strong>{ref_title} (Variant {idx})</strong></summary>')
                            detail_html.append(nested_html)
                            detail_html.append('</details>')
                            expanded_definitions_html.append('\n'.join(detail_html))
        
        oneof_type = oneof_type.rstrip(', ') + '>'
        oneof_type = escape(oneof_type)
        margin_left = (indent_level + 1) * 20
        html = []
        
        html.append(f'<div style="margin-left: {margin_left}px; margin-top: 0px; margin-bottom: 0px;">')
        html.append(f'<strong>{oneof_type}:</strong>')
        html.append('<table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%; max-width: 760px; margin-top: 5px;">')
        html.append('<thead>')
        html.append('<tr style="background-color: #e8e8e8;">')
        html.append(f'<th>Control Value [{control_value_type}]</th>')
        html.append('<th>Type</th>')
        html.append('<th>Details</th>')
        html.append('</tr>')
        html.append('</thead>')
        html.append('<tbody>')
        html.extend(one_of_members_html)
        html.append('</tbody>')
        html.append('</table>')
        
        # Add expanded definitions after the summary table
        if expanded_definitions_html:
            html.extend(expanded_definitions_html)
        
        html.append('</div>')
        
        return '\n'.join(html)
    
    def generate_nested_table(self, schema: Dict[str, Any], definitions: Dict[str, Any], 
                             title: str, indent_level: int = 0) -> str:
        """
        Generate an HTML table for a schema object.
        
        Recursively handles nested objects and creates visual hierarchy.
        """
        if schema.get('type') != 'object':
            return ""
        
        properties = schema.get('properties', {})
        required = schema.get('required', [])
        if not properties:
            return ""
        
        # Sort properties by ordinal index
        sorted_properties = sorted(
            properties.items(),
            key=lambda x: self.get_ordinal_index(x[1])
        )
        
        # Build table HTML
        html = []
        margin_left = indent_level * 20
        
        html.append(f'<div style="margin-left: {margin_left}px; margin-top: 10px;">')
        if title:
            html.append(f'<h3>{escape(title)}</h3>')
        
        html.append('<table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%; max-width: 800px;">')
        html.append('<thead>')
        html.append('<tr style="background-color: #f0f0f0;">')
        html.append('<th>Field Name</th>')
        html.append('<th>Type</th>')
        html.append('<th>Field Index</th>')
        html.append('<th>Description</th>')
        html.append('</tr>')
        html.append('</thead>')
        html.append('<tbody>')
        
        for field_name, field_data in sorted_properties:
            underlying_type = self.get_underlying_type(field_data, definitions)
            ordinal = self.get_ordinal_index(field_data)
            description = escape(field_data.get('description', ''))
            is_required = field_name in required
            
            # Add (Required) suffix to field name if it's a required field
            display_field_name = field_name
            if is_required:
                display_field_name = f"{field_name} (Required)"
            
            # Display ordinal index (or empty if not present)
            ordinal_display = str(ordinal) if ordinal != 9999 else ''
            
            enum_html = ""
            nested_html = ""
            oneof_html = ""
            
            # Check for oneOf first
            if 'oneOf' in field_data:
                oneof_html = self.generate_oneof_table(field_data, 0, definitions)
            # Check for inline enum (defined in the field itself)
            elif 'enum' in field_data:
                enum_values = field_data['enum']
                enum_html = self.generate_enum_table(enum_values, 0)
            # Check for enum reference in title (external enum file)
            elif field_data.get('title', '') in self.enum_cache:
                enum_title = field_data['title']
                enum_values = self.enum_cache[enum_title]
                enum_html = self.generate_enum_table(enum_values, 0)
            # Check if this field references another definition (nested table)
            elif '$ref' in field_data:
                ref_id = field_data['$ref'].split('/')[-1]
                if ref_id in definitions:
                    ref_schema = definitions[ref_id]
                    underlying_type = ref_title = ref_schema.get('title', ref_id)
                    
                    # Skip if title ends with "Payload"
                    if not ref_title.endswith('Payload'):
                        nested_html = self.generate_nested_table(
                            ref_schema, 
                            definitions, 
                            ref_title, 
                            1  # Nested indent
                        )
            # Check if this is an array with object items
            elif field_data.get('type') == 'array':
                items = field_data.get('items', {})
                if '$ref' in items:
                    ref_id = items['$ref'].split('/')[-1]
                    if ref_id in definitions:
                        ref_schema = definitions[ref_id]
                        ref_title = ref_schema.get('title', ref_id)

                        if 'x-serialization-options' in field_data:
                            ref_title += f" ({field_data['x-serialization-options']})"
                                        
                        # Skip if title ends with "Payload"
                        if not ref_title.endswith('Payload'):
                            nested_html = self.generate_nested_table(
                                ref_schema, 
                                definitions, 
                                f"{ref_title} (Array Item)", 
                                1  # Nested indent
                            )
            # Check if this is an object with additionalProperties (map type)
            elif field_data.get('type') == 'object' and 'additionalProperties' in field_data:
                additional_props = field_data['additionalProperties']
                if additional_props.get('type') == 'object' and 'properties' in additional_props:
                    # Build a nested table showing key and value structure
                    nested_html = self.generate_nested_table(
                        additional_props,
                        definitions,
                        "Map Entry",
                        1  # Nested indent
                    )
            
            # Build the main row
            html.append('<tr>')
            
            # Field name - spans 2 rows if there's a nested table, enum, or oneOf
            if enum_html or nested_html or oneof_html:
                html.append(f'<td rowspan="2"><strong>{escape(display_field_name)}</strong></td>')
            else:
                html.append(f'<td><strong>{escape(display_field_name)}</strong></td>')
            
            html.append(f'<td>{underlying_type}</td>')
            html.append(f'<td>{ordinal_display}</td>')
            html.append(f'<td>{description}</td>')
            html.append('</tr>')
            
            # If there's a nested table, enum, or oneOf, add a second row for it
            if oneof_html:
                html.append('<tr>')
                html.append(f'<td colspan="3" style="padding: 0;">{oneof_html}</td>')
                html.append('</tr>')
            elif enum_html:
                html.append('<tr>')
                html.append(f'<td colspan="3">{enum_html}</td>')
                html.append('</tr>')
            elif nested_html:
                html.append('<tr>')
                html.append(f'<td colspan="3">{nested_html}</td>')
                html.append('</tr>')
        
        html.append('</tbody>')
        html.append('</table>')
        html.append('</div>')
        
        return '\n'.join(html)
    
    def get_page_html(self, title: str, content: str, back_link: bool = True) -> str:
        """
        Generate a complete HTML page with styling.
        
        Args:
            title: Page title
            content: HTML content to include in body
            back_link: Whether to include a back to index link
        """
        back_html = ''
        if back_link:
            back_html = '<p><a href="index.html">← Back to Index</a></p>'
        
        return f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{escape(title)}</title>
    <style>
        body {{
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
            line-height: 1.6;
        }}
        .container {{
            max-width: 1200px;
            margin: 0 auto;
            background-color: white;
            padding: 30px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }}
        h1 {{
            color: #2c3e50;
            border-bottom: 3px solid #3498db;
            padding-bottom: 10px;
            margin-top: 0;
        }}
        h2 {{
            color: #34495e;
            border-bottom: 2px solid #3498db;
            padding-bottom: 5px;
            margin-top: 30px;
        }}
        h3 {{
            color: #555;
            margin-top: 20px;
            margin-bottom: 10px;
        }}
        h4 {{
            color: #666;
            margin-top: 15px;
            margin-bottom: 8px;
        }}
        table {{
            background-color: white;
            font-size: 14px;
            margin-bottom: 10px;
        }}
        th {{
            font-weight: bold;
            text-align: left;
            padding: 8px !important;
        }}
        td {{
            padding: 8px !important;
        }}
        tr:nth-child(even) {{
            background-color: #f9f9f9;
        }}
        tr:hover {{
            background-color: #e8f4f8;
        }}
        .description {{
            color: #555;
            font-style: italic;
            margin: 10px 0 20px 0;
            padding: 10px;
            background-color: #f8f9fa;
            border-left: 4px solid #3498db;
        }}
        a {{
            color: #3498db;
            text-decoration: none;
        }}
        a:hover {{
            text-decoration: underline;
        }}
        .packet-list {{
            columns: 3;
            column-gap: 20px;
        }}
        .packet-list li {{
            margin-bottom: 8px;
            break-inside: avoid;
        }}
        details {{
            margin: 10px 0;
        }}
        summary {{
            cursor: pointer;
            font-weight: bold;
            padding: 8px;
            background-color: #f0f0f0;
            border: 1px solid #ddd;
            border-radius: 4px;
            user-select: none;
        }}
        summary:hover {{
            background-color: #e8e8e8;
        }}
        details[open] summary {{
            background-color: #d4edff;
            border-color: #3498db;
            border-left: 4px solid #3498db;
        }}
        @media (max-width: 900px) {{
            .packet-list {{
                columns: 2;
            }}
        }}
        @media (max-width: 600px) {{
            .packet-list {{
                columns: 1;
            }}
        }}
    </style>
</head>
<body>
    <div class="container">
        {back_html}
        {content}
    </div>
</body>
</html>"""
    
    def process_packet_file(self, filepath: Path) -> Tuple[str, str, str, int]:
        """
        Process a single JSON schema file.
        
        Returns:
            Tuple of (packet_name, description, html_content)
            Returns empty strings if file should be skipped
        """
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            title = data.get('title', filepath.stem)
            description = data.get('description', '')
            extra_details = ''
            definitions = data.get('definitions', {})
            meta_properties = data.get('$metaProperties', {})
            
            # Skip files ending with Payload
            if title.endswith('Payload'):
                return "", "", ""
            
            packet_id = -1
            if meta_properties:
                packet_id = meta_properties.get('[cereal:packet]', None)
                title += f" ({packet_id})"
                
                packet_details = meta_properties.get('[cereal:packet_details]', None)
                if packet_details:
                    extra_details = str(packet_details)


            html_parts = []
            html_parts.append(f'<h1>{escape(title)}</h1>')
            
            if description:
                html_parts.append(f'<div class="description">{escape(description)}</div>')

            if (extra_details):
                html_parts.append(f'<div class="description">{escape(extra_details)}</div>')

            
            # Check if main object has a single mPayload property that references a Payload definition
            properties = data.get('properties', {})
            if (data.get('type') == 'object' and 
                len(properties) == 1 and 
                'mPayload' in properties and 
                '$ref' in properties['mPayload']):
                
                # Get the payload definition
                ref_id = properties['mPayload']['$ref'].split('/')[-1]
                if ref_id in definitions:
                    payload_schema = definitions[ref_id]
                    payload_title = payload_schema.get('title', '')
                    
                    # If the payload ends with "Payload", expand it directly
                    if payload_title.endswith('Payload'):
                        table_html = self.generate_nested_table(payload_schema, definitions, "", 0)
                        html_parts.append(table_html)
                    else:
                        # Process normally
                        table_html = self.generate_nested_table(data, definitions, "", 0)
                        html_parts.append(table_html)
                else:
                    # Process normally if ref not found
                    table_html = self.generate_nested_table(data, definitions, "", 0)
                    html_parts.append(table_html)
            elif data.get('type') == 'object' and 'properties' in data:
                # Process main properties normally
                table_html = self.generate_nested_table(data, definitions, "", 0)
                html_parts.append(table_html)
            
            return title, description, '\n'.join(html_parts), packet_id
        
        except Exception as e:
            print(f"Error processing {filepath}: {e}")
            return "", "", "", -1
    
    def generate_documentation(self, json_files: List[Path]):
        """
        Generate complete documentation from all JSON files in source directory.
        
        Creates individual HTML files for each packet and an index page.
        """

        packets = []
        
        # Process each JSON file
        print("Processing packets...")
        for json_file in json_files:
            print(f"  - {json_file.name}")
            title, description, content, packet_id = self.process_packet_file(json_file)
            
            if not title:  # Skip if processing returned empty
                continue
            
            # Generate individual packet HTML file
            output_filename = f"{json_file.stem}.html"
            output_path = self.output_dir / output_filename
            
            page_html = self.get_page_html(title, content, back_link=True)
            
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write(page_html)
            
            packets.append({
                'title': title,
                'description': description,
                'filename': output_filename,
                'id': packet_id
            })
        
        # Generate index page
        print("\nGenerating index page...")
        self.generate_index_page(packets)
        
        print(f"\n✓ Generated {len(packets)} packet documentation files")
        print(f"✓ Output directory: {self.output_dir}")
        print(f"✓ Open {self.output_dir / 'index.html'} in your browser")
    
    def generate_index_page(self, packets: List[Dict[str, str]]):
        """Generate an index page with links to all packet documentation."""
        html_parts = []
        
        html_parts.append('<h1>Game Protocol Documentation</h1>')
        html_parts.append(f'<p>Documentation for {len(packets)} protocol packets.</p>')
        
        html_parts.append('<h2>Packet List</h2>')
        html_parts.append('<ul class="packet-list">')

        packets.sort(key=lambda x: x['id'])
        for packet in packets:
            title = escape(packet['title'])
            desc = escape(packet['description'][:100] + '...' if len(packet['description']) > 100 else packet['description'])
            filename = packet['filename']
            
            html_parts.append(f'<li>')
            html_parts.append(f'<a href="{filename}"><strong>{title}</strong></a>')
            if packet['description']:
                html_parts.append(f'<br><span style="color: #666; font-size: 0.9em;">{desc}</span>')
            html_parts.append(f'</li>')
        
        html_parts.append('</ul>')
        
        content = '\n'.join(html_parts)
        page_html = self.get_page_html('Game Protocol Documentation', content, back_link=False)
        
        index_path = self.output_dir / 'index.html'
        with open(index_path, 'w', encoding='utf-8') as f:
            f.write(page_html)


def main():
    """Main entry point for the script."""
    # Parse command line arguments
    input_path = None
    output_path = None
    
    if len(sys.argv) > 1:
        input_path = Path(sys.argv[1])
        if not input_path.exists():
            print(f"Error: Input path '{input_path}' does not exist")
            sys.exit(1)
        if not input_path.is_dir():
            print(f"Error: Input path '{input_path}' is not a directory")
            sys.exit(1)
    else:
        # Default to script directory
        input_path = Path(__file__).parent
    
    if len(sys.argv) > 2:
        output_path = Path(sys.argv[2])
    else:
        # Default to docs subdirectory in script location
        output_path = Path(__file__).parent / "docs"
    
    print(f"Input directory: {input_path.absolute()}")
    print(f"Output directory: {output_path.absolute()}")
    print()
    
    # Generate documentation
    generator = PacketDocGenerator(output_path, input_path)

    # Get all JSON files except those starting with "enum_"
    json_files = sorted([
        f for f in input_path.glob("*.json") 
        if not f.name.startswith("enum_")
    ])

    if not json_files:
        print(f"Warning: No JSON files found in {input_path}")
        sys.exit(1)

    generator.generate_documentation(json_files)

    print("\nDone! 🎉")


if __name__ == "__main__":
    main()
