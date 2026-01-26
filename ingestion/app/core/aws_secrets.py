import boto3
import json
import os
from functools import lru_cache
from botocore.exceptions import ClientError


@lru_cache(maxsize=1)
def load_secrets() -> dict:
    """
    Load secrets from AWS Secrets Manager using IAM role.
    Cached in-memory to avoid repeated API calls.
    """

    secret_name = os.getenv("SECRET_NAME", "ai-agent/secret")
    region_name = os.getenv("AWS_REGION", "ap-south-1")

    try:
        client = boto3.client(
            service_name="secretsmanager",
            region_name=region_name,
        )

        response = client.get_secret_value(SecretId=secret_name)

        if "SecretString" not in response:
            raise RuntimeError("SecretString not found in Secrets Manager response")

        secrets = json.loads(response["SecretString"])
        return secrets

    except ClientError as e:
        raise RuntimeError(f"Failed to load secrets from Secrets Manager: {e}")