## pip install -U google-generativeai 을 통해 라이브러리 설치필요
## keyring set {{서비스명}} {{계졍명}} 을 통해 key 를 등록하거나 API KEY 를 직접 하드코딩 or .env 활용

import keyring
import google.generativeai as genai

api_key = keyring.get_password('gemini-api-key-mxprnc', 'mxprnc')
# print(f"api_key = {api_key}")

# 1. API 키 설정 (본인의 키로 교체하세요)
genai.configure(api_key=api_key)

# 2. 사용 가능한 모델 목록 출력
# m.name은 'models/gemini-2.5-flash'와 같은 형식을 반환합니다.
model_list = [m.name for m in genai.list_models()]

print(model_list)