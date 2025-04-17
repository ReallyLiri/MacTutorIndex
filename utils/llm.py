import os
import requests
import time
from openai import OpenAI

ANTHROPIC_API_VERSION = "2023-06-01"
ANTHROPIC_MODEL = "claude-3-7-sonnet-20250219"
OPENAI_MODEL = "gpt-4o-mini"
DEFAULT_WAIT_SECONDS = 3
MAX_RETRIES = 5

anthropic_api_key = os.environ.get("ANTHROPIC_API_KEY")
openai_api_key = os.environ.get("OPENAI_API_KEY")

if not anthropic_api_key and not openai_api_key:
    raise Exception("No API key found for either OpenAI or Anthropic")

openai_client = OpenAI() if openai_api_key else None


def anthropic_query(text, prompt, max_tokens=None, temperature=0, max_retries=MAX_RETRIES):
    retries = 0
    while retries <= max_retries:
        try:
            headers = {
                "Content-Type": "application/json",
                "x-api-key": anthropic_api_key,
                "anthropic-version": ANTHROPIC_API_VERSION,
            }

            combined_message = f"{text}\n\n{prompt}"

            data = {
                "model": ANTHROPIC_MODEL,
                "max_tokens": max_tokens,
                "temperature": temperature,
                "messages": [{"role": "user", "content": combined_message}],
                "system": "Extract data in JSON format. Return ONLY valid JSON without explanations or markdown.",
            }

            response = requests.post("https://api.anthropic.com/v1/messages", headers=headers, json=data)
            response.raise_for_status()
            response_json = response.json()

            if response_json and "content" in response_json:
                full_response = ""
                for content_block in response_json["content"]:
                    if content_block["type"] == "text":
                        full_response += content_block["text"]

                json_content = full_response.strip()
                if "```json" in json_content:
                    json_content = json_content.split("```json")[1].split("```")[0].strip()
                elif "```" in json_content:
                    json_content = json_content.split("```")[1].split("```")[0].strip()

                return json_content

            print("\n!!! Unexpected response format from Anthropic API")
            return ""

        except requests.exceptions.HTTPError as e:
            error_str = str(e)
            if e.response.status_code == 429 or "rate_limit_exceeded" in error_str or "quota_exceeded" in error_str:

                retries += 1
                wait_time = DEFAULT_WAIT_SECONDS

                retry_after = e.response.headers.get("retry-after")
                if retry_after and retry_after.isdigit():
                    wait_time = max(DEFAULT_WAIT_SECONDS, int(retry_after) + 1)

                print(f"\n!!! Anthropic rate limit reached. Retrying in {wait_time:.2f}s... ({retries}/{max_retries})")
                time.sleep(wait_time)
            else:
                print(f"\n!!! HTTP error from Anthropic API: {e}")
                return ""

        except Exception as e:
            print(f"\n!!! Error querying Anthropic API: {e}")
            return ""

    print(f"\n!!! Max retries ({max_retries}) exceeded for Anthropic query")
    return ""


def openai_query(question, text, instructions, max_tokens=None, creativity=0, max_retries=MAX_RETRIES):
    retries = 0
    while retries <= max_retries:
        try:
            response = openai_client.chat.completions.create(
                model=OPENAI_MODEL,
                messages=[
                    {"role": "user", "content": question},
                    {"role": "user", "content": text},
                    {"role": "system", "content": instructions},
                ],
                max_tokens=max_tokens,
                temperature=creativity,
            )
            if len(response.choices) != 1:
                print("\n!!! Unexpected response from OpenAI", response)
            if response.choices[0].finish_reason != "stop":
                print("\n!!! OpenAI did not finish processing the request", response)
            return response.choices[0].message.content.lstrip("```json").rstrip("```").strip()
        except Exception as e:
            error_str = str(e)
            if "rate_limit_exceeded" in error_str:
                retries += 1
                wait_time = DEFAULT_WAIT_SECONDS

                try:
                    if "Please try again in " in error_str:
                        wait_suggestion = error_str.split("Please try again in ")[1].split("ms")[0]
                        if wait_suggestion.isdigit():
                            wait_time = max(DEFAULT_WAIT_SECONDS, int(int(wait_suggestion) / 1000) + 1)
                except Exception:
                    pass

                print(f"\n!!! OpenAI rate limit reached. Retrying in {wait_time:.2f}s... ({retries}/{max_retries})")
                time.sleep(wait_time)
            else:
                print(f"\n!!! Error querying OpenAI: {e}")
                return ""

    print(f"\n!!! Max retries ({max_retries}) exceeded for OpenAI query")
    return ""


def query_llm(text, prompt, max_tokens=None, temperature=0):
    if openai_api_key:
        instructions = "Extract exactly the data requested in the specified JSON format. Return ONLY valid JSON."
        return openai_query(prompt, text, instructions, max_tokens, temperature)
    elif anthropic_api_key:
        return anthropic_query(text, prompt, max_tokens, temperature, max_retries=MAX_RETRIES)


def extract_json_from_response(response_str):
    if not response_str:
        print("\n!!! Empty response from LLM")
        return None

    try:
        start_idx = response_str.find("{")
        end_idx = response_str.rfind("}")

        if 0 <= start_idx < end_idx:
            json_str = response_str[start_idx : end_idx + 1]
            return json_str
        return response_str
    except Exception as e:
        print("\n!!! Error extracting JSON from response", e)
        return response_str
