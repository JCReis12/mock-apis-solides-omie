import csv
import json
import urllib.request
from pathlib import Path

# URLs públicas das APIs Mock hospedadas no Render
SOLIDES_API_URL = "https://inovanet-mock-solides.onrender.com/solides/colaboradores"
OMIE_API_URL = "https://inovanet-mock-omie.onrender.com/omie/despesas"

COLABORADORES_IDS = [101, 102]
PERIODOS = ["2026-09", "2026-10"]

OUTPUT_DIR = Path(__file__).parent / "exports_drive"
OUTPUT_DIR.mkdir(exist_ok=True)


def requisitar_json(url: str) -> dict:
    req = urllib.request.Request(url, headers={"Accept": "application/json"})
    with urllib.request.urlopen(req, timeout=60) as response:
        return json.loads(response.read().decode("utf-8"))


def sincronizar_apis_para_drive():
    print("1. Consultando API da Sólides no Render...")
    registros_solides = []
    cpfs_encontrados = []

    for colab_id in COLABORADORES_IDS:
        url = f"{SOLIDES_API_URL}/{colab_id}"
        dados = requisitar_json(url)
        registros_solides.append(dados)
        cpfs_encontrados.append(dados["colaborador_cpf"])

    # Gerar CSV da Sólides para o Google Drive
    csv_solides_path = OUTPUT_DIR / "solides_colaboradores.csv"
    with open(csv_solides_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow([
            "fonte",
            "colaborador_id",
            "nome",
            "colaborador_cpf",
            "cargo",
            "departamento",
            "status",
            "data_admissao",
            "salario_base",
            "vale_refeicao_alimentacao",
            "plano_saude_sulamerica",
            "wellhub_gympass",
            "auxilio_home_office",
            "total_beneficios_fixos",
        ])
        for c in registros_solides:
            b = c["beneficios_fixos"]
            writer.writerow([
                c["fonte"],
                c["colaborador_id"],
                c["nome"],
                c["colaborador_cpf"],
                c["cargo"],
                c["departamento"],
                c["status"],
                c["data_admissao"],
                c["salario_base"],
                b["vale_refeicao_alimentacao"],
                b["plano_saude_sulamerica"],
                b["wellhub_gympass"],
                b["auxilio_home_office"],
                c["total_beneficios_fixos"],
            ])

    print("2. Consultando API do Omie no Render...")
    lancamentos_omie = []
    for cpf in cpfs_encontrados:
        for periodo in PERIODOS:
            url = f"{OMIE_API_URL}?colaborador_cpf={cpf}&periodo={periodo}"
            dados = requisitar_json(url)
            for item in dados.get("despesas", []):
                lancamentos_omie.append({
                    "fonte": dados["fonte"],
                    "colaborador_cpf": dados["colaborador_cpf"],
                    "periodo": dados["periodo"],
                    **item,
                })

    # Gerar CSV do Omie para o Google Drive
    csv_omie_path = OUTPUT_DIR / "omie_despesas.csv"
    with open(csv_omie_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow([
            "fonte",
            "colaborador_cpf",
            "periodo",
            "id_lancamento",
            "data_lancamento",
            "categoria",
            "origem_integracao",
            "descricao",
            "valor",
            "status_pagamento",
        ])
        for d in lancamentos_omie:
            writer.writerow([
                d["fonte"],
                d["colaborador_cpf"],
                d["periodo"],
                d["id_lancamento"],
                d["data_lancamento"],
                d["categoria"],
                d["origem_integracao"],
                d["descricao"],
                d["valor"],
                d["status_pagamento"],
            ])

    print(f"Arquivos gerados com sucesso em: {OUTPUT_DIR}")


if __name__ == "__main__":
    sincronizar_apis_para_drive()
