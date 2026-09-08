import re
import urllib.parse
import aiohttp
from bs4 import BeautifulSoup
from typing import Optional, Dict

class ScraperService:
    @staticmethod
    def extract_domain(url: str) -> str:
        try:
            parsed = urllib.parse.urlparse(url)
            domain = parsed.netloc
            if domain.startswith("www."):
                domain = domain[4:]
            return domain or url
        except Exception:
            return "web"

    @staticmethod
    def get_favicon(url: str) -> str:
        domain = ScraperService.extract_domain(url)
        # Using Google's high-res favicon service
        return f"https://www.google.com/s2/favicons?domain={domain}&sz=64"

    @staticmethod
    async def scrape_url(url: str, timeout_seconds: int = 8) -> Dict[str, str]:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
        try:
            async with aiohttp.ClientSession(headers=headers) as session:
                async with session.get(url, timeout=aiohttp.ClientTimeout(total=timeout_seconds)) as resp:
                    if resp.status != 200:
                        return {"success": False, "content": f"HTTP {resp.status}", "title": ""}
                    html = await resp.text()
                    
                    soup = BeautifulSoup(html, "html.parser")
                    
                    # Extract page title
                    title = soup.title.string.strip() if soup.title and soup.title.string else ""
                    
                    # Clean out scripts, styling, navigation, headers, footers
                    for tag in soup(["script", "style", "nav", "footer", "header", "noscript", "svg", "aside"]):
                        tag.decompose()
                    
                    text = soup.get_text(separator=" ", strip=True)
                    text = re.sub(r"\s+", " ", text)
                    
                    return {
                        "success": True,
                        "content": text[:4000],
                        "title": title
                    }
        except Exception as e:
            return {
                "success": False,
                "content": f"Scrape error: {str(e)}",
                "title": ""
            }

scraper_service = ScraperService()
