from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from semanticscholar import SemanticScholar
import time

app = FastAPI()

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

sch = SemanticScholar()

class SearchQuery(BaseModel):
    query: str

@app.post("/search")
async def search_papers(search_query: SearchQuery):
    try:
        print(f"Searching for: {search_query.query}")
        
        results = sch.search_paper(search_query.query)
        print(f"Found {results.total} papers")
        
        papers = []
        for i, result in enumerate(results[:10]):
            try:
                paper = {
                    "title": result.title,
                    "abstract": result.abstract or "No abstract available",
                    "paperId": result.paperId,
                    "url": result.url,
                    "year": result.year,
                    "authors": [{"name": author.name} for author in (result.authors or [])],
                    "citationCount": result.citationCount or 0,
                    "venue": result.venue,
                    
                }
                papers.append(paper)
                print(f"Added paper: {result.title}")
                
            except Exception as paper_error:
                print(f"Error processing paper: {str(paper_error)}")
                continue
            
        return {
            "total": results.total,
            "papers": papers
        }
        
    except Exception as e:
        print(f"Search error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to search papers: {str(e)}"
        )
        
    #uvicorn api.academic_research:app --reload --port 8000 --loop asyncio