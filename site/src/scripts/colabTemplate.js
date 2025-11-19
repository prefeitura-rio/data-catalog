/**
 * @fileoverview Shared helpers to generate the Colab BigQuery snippet.
 *         Used by colab.js and colabWidget.js.
 */

const PLACEHOLDERS = Object.freeze({
    project: /{PROJECT_ID}/g,
    table: /{TABLE_ID}/g
});

export const DEFAULT_SNIPPET_VALUES = Object.freeze({
    projectId: 'SEU_PROJETO_AQUI',
    tableId: 'seu-projeto.seu_dataset.sua_tabela'
});

const SNIPPET_TEMPLATE = `from google.cloud import bigquery
from google.api_core.exceptions import GoogleAPIError
from google.auth.exceptions import DefaultCredentialsError
from IPython.display import display
import google.colab.auth
import pandas as pd

# -----------------------------------------------------
# Passo 1) Autentique uma vez por sessão
# -----------------------------------------------------
google.colab.auth.authenticate_user()

# -----------------------------------------------------
# Passo 2) Configure o projeto e a tabela alvo
# -----------------------------------------------------
PROJECT_ID = "{PROJECT_ID}"
TABLE_ID = "{TABLE_ID}"

client = bigquery.Client(project=PROJECT_ID)

def query_table(limit: int = 100,
                use_cache: bool = True,
                timeout: int = 60,
                dry_run: bool = False):
    """
    Executa uma consulta simples no BigQuery.
    - limit: número máximo de linhas retornadas
    - use_cache: controla o uso do cache do BigQuery
    - timeout: tempo limite em segundos para aguardar a resposta
    - dry_run: quando True, apenas estima o custo (bytes processados)
    """

    query = f"""
    SELECT
      *
    FROM \`{TABLE_ID}\`
    LIMIT @limit
    """

    job_config = bigquery.QueryJobConfig(
        query_parameters=[
            bigquery.ScalarQueryParameter("limit", "INT64", limit),
        ],
        use_query_cache=use_cache,
        dry_run=dry_run,
    )

    try:
        job = client.query(query, job_config=job_config)

        if dry_run:
            bytes_gb = (job.total_bytes_processed or 0) / 1e9
            print(f"[DRY RUN] bytes estimados: {bytes_gb:.3f} GB")
            return pd.DataFrame()

        df = job.result(timeout=timeout).to_dataframe()
        preview = df.head()

        bytes_gb = (job.total_bytes_processed or 0) / 1e9
        print(f"bytes processados: {bytes_gb:.3f} GB")
        if job.slot_millis is not None:
            print(f"slot_millis: {job.slot_millis}")

        display(preview)
        return df

    except (GoogleAPIError, DefaultCredentialsError) as exc:
        raise RuntimeError(f"Erro ao executar query: {exc}") from exc


if __name__ == "__main__":
    df = query_table(limit=100)
    if not df.empty:
        df.head()
`;

/**
 * Safely replaces placeholders inside the snippet template.
 * @param {string} template
 * @param {Record<keyof typeof PLACEHOLDERS, string>} values
 * @returns {string}
 */
function replaceTemplateValues(template, values) {
    return Object.entries(values).reduce(
        (snippet, [key, value]) => snippet.replace(PLACEHOLDERS[key], value),
        template
    );
}

/**
 * Generates the Colab snippet replacing project/table placeholders.
 * @param {Object} params
 * @param {string} [params.tableId]
 * @param {string} [params.projectId]
 * @returns {string}
 */
export function generateColabSnippet({ tableId, projectId } = {}) {
    const values = {
        project: projectId || DEFAULT_SNIPPET_VALUES.projectId,
        table: tableId || DEFAULT_SNIPPET_VALUES.tableId
    };

    return replaceTemplateValues(SNIPPET_TEMPLATE, values);
}
