import React, { useEffect, useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import './News.css';

interface NewsItem {
  title: string;
  summary: string;
  date: string;
  source: string;
}

const News: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
      if (!API_KEY) {
        console.error('Gemini API key not found');
        setLoading(false);
        return;
      }

      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.0-pro" });

      const prompt = `Generate 10 fictional but realistic tech news articles. Return ONLY a valid JSON array with no additional text. Each object should have: title (string), summary (string), date (string like "2024-11-14"), source (string like "TechCrunch"). Format: [{"title": "...", "summary": "...", "date": "...", "source": "..."}, ...]`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();

      // Clean the response text
      text = text.trim();
      if (text.startsWith('```json')) {
        text = text.replace(/```json\s*/, '').replace(/```\s*$/, '');
      } else if (text.startsWith('```')) {
        text = text.replace(/```\s*/, '').replace(/```\s*$/, '');
      }

      // Try to parse as JSON
      let newsData: NewsItem[];
      try {
        newsData = JSON.parse(text);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.log('Raw response:', text);
        // Fallback: try to extract JSON from the text
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          newsData = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('Could not parse JSON from response');
        }
      }

      setNews(newsData);
    } catch (error) {
      console.error('Error fetching news:', error);
      // Set some sample data for testing
      setNews([
        {
          title: "AI Breakthrough in Healthcare",
          summary: "New AI model shows 95% accuracy in early disease detection, revolutionizing medical diagnostics.",
          date: "2024-11-14",
          source: "TechHealth News"
        },
        {
          title: "Quantum Computing Milestone",
          summary: "Scientists achieve stable quantum entanglement for over an hour, paving way for practical quantum computers.",
          date: "2024-11-13",
          source: "Quantum Daily"
        },
        {
          title: "Sustainable Tech Innovation",
          summary: "Breakthrough in biodegradable electronics could reduce e-waste by 70% in the next decade.",
          date: "2024-11-12",
          source: "GreenTech Magazine"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="news-loading">
        <div className="loading-spinner"></div>
        <p>Loading latest tech news...</p>
      </div>
    );
  }

  return (
    <div className="news-container">
      <div className="news-header">
        <h2>Latest Tech News</h2>
        <p>Stay updated with the latest technology news</p>
      </div>

      <div className="news-grid">
        {news.map((item, index) => (
          <div key={index} className="news-card">
            <div className="news-card-header">
              <h3 className="news-title">{item.title}</h3>
              <div className="news-meta">
                <span className="news-source">{item.source}</span>
                <span className="news-date">{item.date}</span>
              </div>
            </div>
            <div className="news-summary">
              <p>{item.summary}</p>
            </div>
          </div>
        ))}
      </div>

      {news.length === 0 && (
        <div className="news-empty">
          <p>No news available at the moment.</p>
        </div>
      )}
    </div>
  );
};

export default News;