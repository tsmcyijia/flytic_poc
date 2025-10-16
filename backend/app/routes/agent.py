
import os, json
from fastapi import APIRouter
from pydantic import BaseModel
import openai
from app.services.ai_tools import search_flights, calendar_price, risk_estimate
router = APIRouter()
openai.api_type = "azure"; openai.api_base = os.getenv("AZURE_OPENAI_ENDPOINT",""); openai.api_key = os.getenv("AZURE_OPENAI_KEY",""); openai.api_version = os.getenv("OPENAI_API_VERSION","2023-07-01-preview")
DEPLOY = os.getenv("AZURE_OPENAI_DEPLOYMENT","")
functions = [{
  "name":"search_flights","description":"查詢航班/票價","parameters":{"type":"object","properties":{"origin":{"type":"string"},"destination":{"type":"string"},"depart_date":{"type":"string"},"return_date":{"type":"string"},"adults":{"type":"integer","default":1}},"required":["origin","destination","depart_date"]}
},{
  "name":"calendar_price","description":"查詢一段時窗內最便宜日期","parameters":{"type":"object","properties":{"origin":{"type":"string"},"destination":{"type":"string"}},"required":["origin","destination"]}
},{
  "name":"risk_estimate","description":"評估轉機風險","parameters":{"type":"object","properties":{"segments":{"type":"integer"},"min_layover_minutes":{"type":"integer"}},"required":["segments","min_layover_minutes"]}
}]
class ChatPayload(BaseModel): messages: list
@router.post("/agent/chat")
def chat(p: ChatPayload):
    try:
        if not DEPLOY or not openai.api_base or not openai.api_key:
            return {"reply":"（提醒：尚未設定 Azure OpenAI 金鑰或部署名稱）請設定 AZURE_OPENAI_ENDPOINT / AZURE_OPENAI_KEY / AZURE_OPENAI_DEPLOYMENT。","flights":[]}
        resp = openai.ChatCompletion.create(engine=DEPLOY, messages=p.messages, functions=functions, function_call="auto", temperature=0.2)
        msg = resp["choices"][0]["message"]
        if msg.get("function_call"):
            name = msg["function_call"]["name"]; args = json.loads(msg["function_call"]["arguments"] or "{}")
            if name=="search_flights":
                content = search_flights(args.get("origin","TPE"), args.get("destination","NRT"), args.get("depart_date"), args.get("return_date"), int(args.get("adults",1)))
            elif name=="calendar_price":
                content = calendar_price(args.get("origin","TPE"), args.get("destination","NRT"))
            elif name=="risk_estimate":
                content = json.dumps({"risk": risk_estimate(int(args.get("segments",1)), int(args.get("min_layover_minutes",90)))})
            else: content = json.dumps({"error":"unknown function"})
            resp2 = openai.ChatCompletion.create(engine=DEPLOY, messages=p.messages+[msg, {"role":"function","name":name,"content":content}], temperature=0.2)
            final_text = resp2["choices"][0]["message"]["content"]
            flights = None
            try: flights = json.loads(content).get("flights")
            except Exception: flights=None
            return {"reply": final_text, "flights": flights}
        else:
            return {"reply": msg.get("content",""), "flights": []}
    except Exception as e:
        return {"reply": f"（後端錯誤）{type(e).__name__}: {str(e)}", "flights": []}
