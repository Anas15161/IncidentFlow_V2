import json
import sys

def generate_puml(file_path, output_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    models = data['data']['layers'][1]['models']
    
    tables = {}
    edges = []
    
    # 1. Extract all tables and columns
    for uid, model in models.items():
        if model.get('type') == 'table':
            table_data = model.get('otherInfo', {}).get('data', {})
            table_name = table_data.get('name', f"Unknown_{uid[:5]}")
            columns = table_data.get('columns', [])
            
            tables[uid] = {
                'name': table_name,
                'columns': columns
            }
            
        elif model.get('type') == 'onetomany':
            source = model.get('source')
            target = model.get('target')
            if source and target:
                edges.append((source, target))

    # 2. Generate PlantUML syntax
    puml_lines = []
    puml_lines.append("@startuml")
    puml_lines.append("!theme plain")
    puml_lines.append("skinparam linetype ortho")
    puml_lines.append("skinparam EntityBackgroundColor #F8FAFC")
    puml_lines.append("hide circle")
    puml_lines.append("scale max 3000 width")
    puml_lines.append("")
    
    # Define entities
    for uid, table in tables.items():
        table_name = table['name']
        puml_lines.append(f'entity "{table_name}" {{')
        
        for col in table['columns']:
            col_name = col.get('name', 'unknown')
            col_type = col.get('typname', 'varchar')
            is_pk = col.get('is_primary_key', False)
            
            if is_pk:
                puml_lines.append(f'  * {col_name} : {col_type} <<PK>>')
            else:
                puml_lines.append(f'  {col_name} : {col_type}')
                
        puml_lines.append("}")
        puml_lines.append("")
        
    # Define relationships
    # PlantUML ERD relations: Entity1 }o--|| Entity2
    for source_uid, target_uid in edges:
        source_name = tables.get(source_uid, {}).get('name')
        target_name = tables.get(target_uid, {}).get('name')
        if source_name and target_name:
            # Postgres onetomany link generally means: Target has the Foreign Key referencing Source
            # Or vice-versa depending on how pgAdmin exports it.
            # We'll just draw a standard relationship line
            puml_lines.append(f'"{source_name}" ||--o{{ "{target_name}" : ""')
            
    puml_lines.append("")
    puml_lines.append("@enduml")
    
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write("\n".join(puml_lines))

if __name__ == "__main__":
    generate_puml(sys.argv[1], sys.argv[2])
