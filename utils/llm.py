import os
import requests
from openai import OpenAI

anthropic_api_key = os.environ.get("ANTHROPIC_API_KEY")
openai_api_key = os.environ.get("OPENAI_API_KEY")

if not anthropic_api_key and not openai_api_key:
    raise Exception("No API key found for either OpenAI or Anthropic")

openai_client = OpenAI() if openai_api_key else None


def anthropic_query(text, prompt, max_tokens=1000, temperature=0):
    try:
        headers = {
            "Content-Type": "application/json",
            "x-api-key": anthropic_api_key,
            "anthropic-version": "2023-06-01"
        }

        combined_message = f"{text}\n\n{prompt}"

        data = {
            "model": "claude-3-7-sonnet-20250219",
            "max_tokens": max_tokens,
            "temperature": temperature,
            "messages": [
                {"role": "user", "content": combined_message}
            ],
            "system": "You are a data extraction assistant. Extract exactly the data requested in the JSON format specified. Return ONLY valid JSON without any explanations or markdown formatting."
        }

        response = requests.post(
            "https://api.anthropic.com/v1/messages",
            headers=headers,
            json=data
        )

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

        print("!!! Unexpected response format from Anthropic API")
        return ""

    except Exception as e:
        print(f"!!! Error querying Anthropic API: {e}")
        return ""


def openai_query(question, text, instructions, max_tokens=1000, creativity=0):
    try:
        response = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "user", "content": question},
                {"role": "user", "content": text},
                {"role": "system", "content": instructions},
            ],
            max_tokens=max_tokens,
            temperature=creativity
        )
        if len(response.choices) != 1:
            print("!!! Unexpected response from OpenAI", response)
        if response.choices[0].finish_reason != 'stop':
            print("!!! OpenAI did not finish processing the request", response)
        return response.choices[0].message.content.lstrip("```json").rstrip("```").strip()
    except Exception as e:
        print(f"!!! Error querying OpenAI: {e}")
        return ""


def query_llm(text, prompt, max_tokens=1000, temperature=0):
    if openai_api_key:
        instructions = "You are a data extraction assistant. Extract exactly the data requested in the JSON format specified. Return ONLY valid JSON."
        return openai_query(prompt, text, instructions, max_tokens, temperature)
    elif anthropic_api_key:
        return anthropic_query(text, prompt, max_tokens, temperature)


def extract_json_from_response(response_str):
    if not response_str:
        print("!!! Empty response from LLM")
        return None

    try:
        start_idx = response_str.find('{')
        end_idx = response_str.rfind('}')

        if 0 <= start_idx < end_idx:
            json_str = response_str[start_idx:end_idx + 1]
            return json_str
        return response_str
    except Exception as e:
        print("!!! Error extracting JSON from response", e)
        return response_str
