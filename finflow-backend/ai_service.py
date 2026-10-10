"""
AI Integration for FinFlow AI Assistant.

Provider cascade (most to least cost-effective):
  1. Google Gemini  — free-tier generous, fast, no setup beyond API key
  2. OpenAI         — paid, best quality
  3. Local Ollama   — free, no internet needed, requires local install
  4. Intelligent Fallback — always works, no external dependencies

Security model:
  - ONLY conversation history and the current message are sent to the AI.
  - NO banking credentials, OTPs or account numbers handled.
  - API keys live ONLY in this server process (loaded from .env).
"""
from __future__ import annotations
import logging
from typing import Optional

from config import settings

logger = logging.getLogger(__name__)

# ── System prompt ──────────────────────────────────────────────────────
_SYSTEM_PROMPT = """You are FinFlow's AI Financial Assistant — a helpful, warm, and knowledgeable personal finance advisor specialising in Indian personal finance.

Your role:
- Help users understand their spending habits and budget management.
- Provide actionable, practical tips for saving money in India.
- Reference Indian financial context: UPI, Swiggy, Zomato, Flipkart, Amazon India, OTT subscriptions (Netflix, Hotstar, Prime), petrol prices, grocery costs, etc.
- All amounts are in Indian Rupees (₹). Always format numbers like ₹1,00,000.
- Be concise but insightful. Use bullet points for lists.
- If you don't have enough financial data yet, acknowledge it and ask clarifying questions.

Boundaries:
- Do not make stock market predictions or give investment advice beyond general savings guidance.
- Do not ask for or handle banking credentials, OTPs, or account numbers.
- Keep responses under 300 words unless the user explicitly asks for detail.

Tone: Professional but friendly, like a trusted financial advisor."""

_DEFAULT_SUGGESTIONS = [
    "How can I save more this month?",
    "What is the 50-30-20 rule?",
    "Tips to reduce food expenses",
]


# ─────────────────────────────────────────────────────────────────────
# Provider 1: Google Gemini
# ─────────────────────────────────────────────────────────────────────
def _call_gemini(user_message: str, conversation_history: list[dict]) -> Optional[str]:
    """Attempt to generate reply using Google Gemini API."""
    if not settings.GEMINI_API_KEY:
        logger.debug("Gemini API key not configured — skipping.")
        return None

    try:
        import google.generativeai as genai
        genai.configure(api_key=settings.GEMINI_API_KEY)

        model = genai.GenerativeModel(
            model_name=settings.GEMINI_MODEL,
            system_instruction=_SYSTEM_PROMPT,
        )

        # Build conversation history in Gemini format
        history_formatted = []
        for msg in conversation_history:
            role = "user" if msg.get("role") == "user" else "model"
            content = msg.get("content", "").strip()
            if content:
                history_formatted.append({"role": role, "parts": [content]})

        chat = model.start_chat(history=history_formatted)
        response = chat.send_message(user_message)

        if response and response.text:
            logger.info("Generated reply using Gemini (%s)", settings.GEMINI_MODEL)
            return response.text.strip()

    except Exception as exc:
        logger.warning("Gemini API call failed: %s", exc)

    return None


# ─────────────────────────────────────────────────────────────────────
# Provider 2: OpenAI
# ─────────────────────────────────────────────────────────────────────
def _call_openai(user_message: str, conversation_history: list[dict]) -> Optional[str]:
    """Attempt to generate reply using OpenAI API."""
    if not settings.OPENAI_API_KEY:
        logger.debug("OpenAI API key not configured — skipping.")
        return None

    try:
        from openai import OpenAI
        client = OpenAI(api_key=settings.OPENAI_API_KEY)

        messages = [{"role": "system", "content": _SYSTEM_PROMPT}]
        for msg in conversation_history:
            if msg.get("role") in ("user", "assistant") and msg.get("content"):
                messages.append({"role": msg["role"], "content": msg["content"]})
        messages.append({"role": "user", "content": user_message})

        response = client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=messages,  # type: ignore[arg-type]
            max_tokens=settings.OPENAI_MAX_TOKENS,
            temperature=0.7,
        )
        reply = response.choices[0].message.content
        if reply:
            logger.info("Generated reply using OpenAI (%s)", settings.OPENAI_MODEL)
            return reply.strip()

    except Exception as exc:
        logger.warning("OpenAI API call failed: %s", exc)

    return None


# ─────────────────────────────────────────────────────────────────────
# Provider 3: Local Ollama
# ─────────────────────────────────────────────────────────────────────
def _call_ollama(user_message: str, conversation_history: list[dict]) -> Optional[str]:
    """Attempt to generate reply using local Ollama model."""
    if not settings.OLLAMA_HOST:
        return None

    try:
        import httpx
        messages = [{"role": "system", "content": _SYSTEM_PROMPT}]
        for msg in conversation_history:
            if msg.get("role") in ("user", "assistant") and msg.get("content"):
                messages.append({"role": msg["role"], "content": msg["content"]})
        messages.append({"role": "user", "content": user_message})

        endpoint = f"{settings.OLLAMA_HOST.rstrip('/')}/api/chat"
        payload = {
            "model": settings.OLLAMA_MODEL,
            "messages": messages,
            "stream": False,
        }

        response = httpx.post(endpoint, json=payload, timeout=settings.OLLAMA_TIMEOUT)
        if response.status_code == 200:
            data = response.json()
            reply = data.get("message", {}).get("content", "")
            if reply:
                logger.info("Generated reply using local Ollama (%s)", settings.OLLAMA_MODEL)
                return reply.strip()
        else:
            logger.warning("Ollama returned status %s", response.status_code)

    except Exception as exc:
        logger.warning("Ollama API call failed (is it running?): %s", exc)

    return None


# ─────────────────────────────────────────────────────────────────────
# Provider 4: Intelligent Rule-Based Fallback (always works)
# ─────────────────────────────────────────────────────────────────────
def _generate_intelligent_fallback(user_message: str) -> str:
    """Rich, context-aware Indian personal finance responses — no external API needed."""
    msg = user_message.lower()

    if any(w in msg for w in ["food", "swiggy", "zomato", "dining", "restaurant", "eat"]):
        return (
            "### 🍽️ Managing Food & Dining Expenses\n\n"
            "Food delivery is typically the **#1 budget leak** in India. Here's how to fix it:\n\n"
            "- **Set a weekly cap:** Limit Swiggy/Zomato orders to 2–3 times per week\n"
            "- **Use subscription plans:** Swiggy One or Zomato Gold saves ₹150–₹300/month on delivery fees\n"
            "- **Batch cook on weekends:** Prepare 3–4 meals to reduce weekday delivery temptation\n"
            "- **Track small UPI payments:** ₹150–₹300 coffee/snack orders add up to ₹3,000–₹5,000/month\n"
            "- **Use grocery apps:** BigBasket or JioMart for weekly groceries (15–20% cheaper than local)\n\n"
            "**Potential savings: ₹3,000–₹6,000/month** just by cooking 2 extra meals at home!"
        )

    if any(w in msg for w in ["exceed", "over budget", "limit"]):
        return (
            "### 🚨 Budget Exceeded — Recovery Plan\n\n"
            "When you've exceeded your budget, here's what to do immediately:\n\n"
            "**This week:**\n"
            "- Pause all non-essential subscriptions (OTTs, gym, apps)\n"
            "- Switch to home-cooked meals for the next 7 days\n"
            "- Avoid Amazon/Flipkart browsing (use the 48-hour rule before buying)\n\n"
            "**This month:**\n"
            "- Move excess spending into next month's budget planning\n"
            "- Review which category caused the overspend — address the root cause\n"
            "- Set category alerts in FinFlow so you're warned at 80% of each limit\n\n"
            "**Remember:** One bad month doesn't break your financial plan. Adjust and continue!"
        )

    if any(w in msg for w in ["budget", "50", "30", "20", "rule", "plan", "limit"]):
        return (
            "### 📊 The 50-30-20 Budgeting Framework\n\n"
            "A proven framework for Indian salaries:\n\n"
            "| Category | % | Examples |\n"
            "|----------|---|----------|\n"
            "| **Needs** | 50% | Rent, groceries, electricity, internet, commute |\n"
            "| **Wants** | 30% | Dining out, OTT, shopping, weekend trips |\n"
            "| **Savings** | 20% | Emergency fund, SIPs, PPF, loan prepayment |\n\n"
            "**Pro Tip for India:** Auto-transfer 20% to savings on salary day *before* you spend. "
            "You won't miss what you don't see!\n\n"
            "- On ₹50,000/month: Save ₹10,000, Needs ₹25,000, Fun ₹15,000\n"
            "- On ₹80,000/month: Save ₹16,000, Needs ₹40,000, Fun ₹24,000"
        )

    if any(w in msg for w in ["save", "saving", "5000", "₹5", "emergency", "fund"]):
        return (
            "### 💡 How to Save ₹5,000 This Month\n\n"
            "Here are 5 proven tactics specific to India:\n\n"
            "1. **Reduce food delivery** (Swiggy/Zomato) → Cook at home 3 extra days → **Saves ₹1,500–₹2,000**\n"
            "2. **Pause one OTT subscription** (Netflix ₹649, Prime ₹299) → **Saves ₹300–₹650**\n"
            "3. **Use public transport/carpool** instead of Ola/Uber for short trips → **Saves ₹800–₹1,200**\n"
            "4. **Stop impulse Amazon/Flipkart shopping** — use a 24-hour wishlist rule → **Saves ₹1,000–₹1,500**\n"
            "5. **Switch to home gym / outdoor running** for 1 month → **Saves ₹500–₹2,000**\n\n"
            "**Total potential savings: ₹4,100–₹7,350/month** — well above your ₹5,000 target! 🎯"
        )

    if any(w in msg for w in ["predict", "forecast", "end of month", "month end"]):
        return (
            "### 🤖 Expense Forecasting\n\n"
            "Without live data access in this mode, here's a general forecasting approach:\n\n"
            "**Simple Linear Forecast:**\n"
            "- If you're 50% through the month and spent ₹X → predicted total = ₹X × 2\n"
            "- Add a 10–15% buffer for unexpected expenses (bills, medical, etc.)\n\n"
            "**Warning signs you'll overshoot:**\n"
            "- Weekend spending is consistently higher than weekday average\n"
            "- You've already hit 60%+ of budget before mid-month\n"
            "- Festival season or travel planned in remaining days\n\n"
            "**Action:** Open the Analytics tab in FinFlow to see your exact daily spending trend!"
        )

    if any(w in msg for w in ["invest", "sip", "mutual fund", "stock", "equity", "fd", "fixed deposit"]):
        return (
            "### 📈 Investment Basics for India\n\n"
            "**Start here (in order):**\n\n"
            "1. **Emergency Fund first** — 3–6 months of expenses in a liquid fund or FD\n"
            "2. **Clear high-interest debt** — Credit card debt at 36–42% p.a. is toxic\n"
            "3. **Start a SIP** — ₹1,000/month in a Nifty 50 index fund is better than nothing\n"
            "4. **Tax saving (80C)** — ELSS funds, PPF, or NPS before March 31st\n\n"
            "**Beginner-friendly options:**\n"
            "- Parag Parikh Flexi Cap / Nifty 50 Index Fund (long-term wealth)\n"
            "- Liquid Mutual Fund (better than savings account for emergency fund)\n"
            "- PPF (15-year lock-in but tax-free returns)\n\n"
            "*Note: This is general education, not financial advice. Consult a SEBI-registered advisor.*"
        )

    if any(w in msg for w in ["goal", "target", "vacation", "laptop", "car", "house", "wedding"]):
        return (
            "### 🎯 Setting & Achieving Financial Goals\n\n"
            "**The SMART Goal Framework for saving in India:**\n\n"
            "- **Specific:** 'Save ₹40,000 for a Goa trip' not 'save for travel'\n"
            "- **Measurable:** Track progress monthly in FinFlow Goals\n"
            "- **Achievable:** If goal needs ₹40K in 4 months → save ₹10K/month\n"
            "- **Relevant:** Align with your priorities, not social pressure\n"
            "- **Time-bound:** Set a hard deadline\n\n"
            "**Pro tip:** Create a dedicated savings account (or FD) for each major goal. "
            "Keeping money separate prevents accidental spending. Many banks let you open "
            "multiple zero-balance sub-accounts instantly via their apps!"
        )

    if any(w in msg for w in ["transport", "petrol", "fuel", "uber", "ola", "rapido", "commute"]):
        return (
            "### 🚗 Reducing Transport Expenses in India\n\n"
            "**Quick wins:**\n\n"
            "- **Carpool with colleagues:** Split Ola/Uber → save 40–60% on commute\n"
            "- **Metro/bus pass:** ₹500–₹1,500/month vs ₹3,000–₹5,000 on cabs\n"
            "- **Rapido for short hops:** Often 30–50% cheaper than Ola/Uber for <5km rides\n"
            "- **Vehicle maintenance:** Regular servicing improves petrol mileage by 10–15%\n"
            "- **Petrol price timing:** Fill up early morning (fuel denser at lower temps)\n\n"
            "**Potential savings: ₹1,500–₹3,000/month** by optimising transport habits!"
        )

    # Generic helpful response
    return (
        "### 🤖 FinFlow AI Financial Assistant\n\n"
        f"Great question about **\"{user_message.strip()}\"**! Here are my top tips:\n\n"
        "**Immediate actions you can take today:**\n"
        "- 📊 Check your **Analytics** tab to see your top spending categories\n"
        "- 🎯 Visit **Budget** to set monthly caps for each category\n"
        "- 💳 Log all transactions (especially UPI ones) — small amounts add up fast!\n\n"
        "**This month's financial health checklist:**\n"
        "- ✅ Emergency fund: 3 months of expenses in a liquid account?\n"
        "- ✅ No credit card debt carrying over month-to-month?\n"
        "- ✅ Saving at least 20% of income?\n\n"
        "Feel free to ask me about: food expenses, budgeting rules, saving strategies, "
        "investment basics, or specific spending categories!"
    )


# ─────────────────────────────────────────────────────────────────────
# Main entry point — cascades through providers
# ─────────────────────────────────────────────────────────────────────
def generate_ai_reply(
    user_message: str,
    conversation_history: list[dict],
) -> tuple[str, list[str]]:
    """
    Generate an AI reply using the best available provider.

    Cascade order:
    1. Google Gemini  (if GEMINI_API_KEY is set)
    2. OpenAI         (if OPENAI_API_KEY is set)
    3. Local Ollama   (if OLLAMA_HOST is reachable)
    4. Intelligent Fallback (always works)
    """
    reply_text: Optional[str] = None

    # Try Gemini first (free tier, fast)
    reply_text = _call_gemini(user_message, conversation_history)

    # Try OpenAI
    if not reply_text:
        reply_text = _call_openai(user_message, conversation_history)

    # Try local Ollama
    if not reply_text:
        reply_text = _call_ollama(user_message, conversation_history)

    # Always-available intelligent fallback
    if not reply_text:
        logger.info(
            "All cloud/local AI providers unavailable — using intelligent fallback. "
            "Set GEMINI_API_KEY in .env for full AI capability."
        )
        reply_text = _generate_intelligent_fallback(user_message)

    suggestions = _generate_suggestions(user_message, reply_text)
    return reply_text, suggestions


def _generate_suggestions(user_message: str, reply: str) -> list[str]:
    """Generate 3 contextual follow-up prompt suggestions."""
    combined = (user_message + " " + reply).lower()

    if any(k in combined for k in ["food", "swiggy", "zomato", "dining"]):
        return ["Show me my budget status", "How can I save ₹5,000?", "Explain the 50-30-20 rule"]
    elif any(k in combined for k in ["budget", "limit", "50-30-20", "exceed"]):
        return ["How can I save more?", "Tips to reduce food expenses", "Predict my monthly expenses"]
    elif any(k in combined for k in ["save", "saving", "emergency", "5000"]):
        return ["What is an emergency fund?", "Best savings strategies for India", "How to set a financial goal"]
    elif any(k in combined for k in ["invest", "mutual fund", "sip", "stock"]):
        return ["What is a SIP?", "Difference between SIP and FD", "How to start investing with ₹1,000"]
    elif any(k in combined for k in ["transport", "petrol", "fuel", "commute"]):
        return ["Analyze my overall budget", "Tips to save on food expenses", "How to build an emergency fund"]
    elif any(k in combined for k in ["goal", "target", "vacation", "laptop"]):
        return ["How to save faster for my goal?", "What is the 50-30-20 rule?", "Show budget tips"]
    else:
        return _DEFAULT_SUGGESTIONS
