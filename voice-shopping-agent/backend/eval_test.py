import httpx
import asyncio
import uuid

BASE_URL = "http://localhost:8000"


async def run_eval():
    session_id = f"eval_{uuid.uuid4().hex[:8]}"
    print(f"=== STARTING EVALUATION RUN [Session: {session_id}] ===")

    test_cases = [
        (
            "Turn 1: Small Talk",
            "Hello! How can you help me today?",
            lambda r: (
                "browse" in r.lower()
                or "shop" in r.lower()
                or "help" in r.lower()
            ),
        ),
        (
            "Turn 2: Tool Call (Filters)",
            "What product categories do you have?",
            lambda r: (
                "category" in r.lower()
                or "collection" in r.lower()
                or "available" in r.lower()
            ),
        ),
        (
            "Turn 3: Product Search",
            "Show me some products from the catalog",
            lambda r: (
                "product" in r.lower()
                or "collection" in r.lower()
                or "item" in r.lower()
            ),
        ),
        (
            "Turn 4: Add Discovered Item",
            "Add the first item to my cart in one of its available sizes",
            lambda r: (
                "cart" in r.lower()
                or "added" in r.lower()
            ),
        ),
        (
            "Turn 5: Store Policy RAG",
            "What is your return policy?",
            lambda r: (
                "14 days" in r.lower()
                or "return" in r.lower()
            ),
        ),
        (
            "Turn 6: Out of Scope Guardrail",
            "Why is Pakistan fuel prices changing everyday?",
            lambda r: (
                "fashion" in r.lower()
                or "store" in r.lower()
                or "assist" in r.lower()
                or "longer" in r.lower()
            ),
        ),
    ]

    async with httpx.AsyncClient(
        base_url=BASE_URL,
        timeout=130.0,
    ) as client:
        for name, prompt, validator in test_cases:
            print(f"\n--- {name} ---")
            print(f"[User]: {prompt}")

            try:
                await asyncio.sleep(3)

                response = await client.post(
                    "/api/chat",
                    json={
                        "session_id": session_id,
                        "message": prompt,
                    },
                )

                if response.status_code != 200:
                    print(
                        f"[FAIL] HTTP {response.status_code}: "
                        f"{response.text}"
                    )
                    return

                data = response.json()

                reply = data.get("reply", "")
                actions = [
                    action["tool"]
                    for action in data.get("actions", [])
                ]
                intent = data.get("shopping_intent", {})

                print(f"[Agent]: {reply}")
                print(f"[Tools Executed]: {actions}")
                print(f"[Shopping Intent]: {intent}")

                assert validator(reply), (
                    "Response failed validation criteria!"
                )

                print("[PASS] Turn validated successfully.")

            except Exception as error:
                print(f"[ERROR during {name}]: {error}")
                return

    print("\n============================================")
    print("ALL CONVERSATION & GUARDRAIL TURNS PASSED!")
    print("============================================")


if __name__ == "__main__":
    asyncio.run(run_eval())