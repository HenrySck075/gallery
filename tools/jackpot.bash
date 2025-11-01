WORKFLOW_FILE="puppet.yml"
ARTIFACT_NAME="images"

# --- Step 1: List and Iterate Recent Successful Workflow Runs ---
# Query the 20 most recent successful runs for the workflow.
# Using 'per_page=20' provides a buffer in case multiple recent runs lacked the artifact.
RUNS_URL="https://api.github.com/repos/$GITHUB_REPOSITORY/actions/workflows/$WORKFLOW_FILE/runs?status=success&per_page=20"

RUNS_JSON=$(curl -sL \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer $TOKEN" \
  "$RUNS_URL")

# Extract an array of Run IDs using jq
RUN_IDS=$(echo "$RUNS_JSON" | jq -r '.workflow_runs[].id')

if [ -z "$RUN_IDS" ]; then
  echo "::error::Could not find any successful runs for $WORKFLOW_FILE."
  exit 1
fi

FOUND_DATE=""

# Loop through the Run IDs, newest to oldest
for RUN_ID in $RUN_IDS; do
  echo "Checking Run ID: $RUN_ID"

  # --- Step 2: Check for the presence of the specific artifact in this run ---
  ARTIFACT_URL="https://api.github.com/repos/$GITHUB_REPOSITORY/actions/runs/$RUN_ID/artifacts?name=$ARTIFACT_NAME"
  
  ARTIFACT_JSON=$(curl -sL \
    -H "Accept: application/vnd.github+json" \
    -H "Authorization: Bearer $TOKEN" \
    "$ARTIFACT_URL")

  # Check if the 'artifacts' array has at least one item
  if [ "$(echo "$ARTIFACT_JSON" | jq -r '.total_count')" != "0" ]; then
    # Artifact found! Extract the upload date (created_at) and break the loop.
    FOUND_DATE=$(echo "$ARTIFACT_JSON" | jq -r '.artifacts[0].created_at')
    echo "::notice title=Artifact Found::Artifact '$ARTIFACT_NAME' found in Run ID $RUN_ID."
    break
  fi
done

# Output the result
if [ -n "$FOUND_DATE" ]; then
  echo "The latest uploaded date for artifact '$ARTIFACT_NAME' is: $FOUND_DATE"
  # Set as a workflow output if needed for later steps
  # echo "latest_upload_date=$FOUND_DATE" >> $GITHUB_OUTPUT
  
  # Replace {{UPLOAD_DATE}} in index.html with $FOUND_DATE
  sed -i "s/{{UPLOAD_DATE}}/$FOUND_DATE/g" index.html
else
  echo "::error::Artifact '$ARTIFACT_NAME' was not found in the last 20 successful runs of $WORKFLOW_FILE."
  exit 1
fi
