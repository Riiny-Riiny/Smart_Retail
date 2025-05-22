import { Product } from '@/types/competitor';
import OpenAI from 'openai';

export class OpenAIService {
  private static openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    dangerouslyAllowBrowser: true // Only for development, remove in production
  });

  static async generatePriceInsights(products: Product[]): Promise<string> {
    try {
      const prompt = `
        Analyze the following product data and provide insights about pricing strategies, trends, and recommendations:
        ${JSON.stringify(products, null, 2)}

        Please provide insights on:
        1. Price ranges and positioning
        2. Competitive advantages or disadvantages
        3. Potential pricing strategies
        4. Notable patterns or anomalies
        5. Recommendations for price adjustments

        Format the response in clear, concise bullet points.
      `;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content: "You are a retail pricing analyst expert. Analyze the provided product data and generate actionable insights."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      });

      return response.choices[0]?.message?.content || "No insights generated";
    } catch (error) {
      console.error('Error generating insights:', error);
      throw new Error('Failed to generate price insights');
    }
  }
} 