import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage, SystemMessage, AIMessage, BaseMessage } from "@langchain/core/messages";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export class LangChainService {
  private model: ChatGoogleGenerativeAI;
  
  constructor() {
    // Initialize the model server-side only
    if (process.env.GOOGLE_API_KEY) {
      this.model = new ChatGoogleGenerativeAI({
        apiKey: process.env.GOOGLE_API_KEY,
        model: "gemini-pro",
        temperature: 0.7,
      });
    } else {
      throw new Error("GOOGLE_API_KEY is not set");
    }
  }

  private convertToLangChainMessage(message: ChatMessage): BaseMessage {
    switch (message.role) {
      case 'user':
        return new HumanMessage(message.content);
      case 'assistant':
        return new AIMessage(message.content);
      case 'system':
        return new SystemMessage(message.content);
      default:
        throw new Error(`Unknown message role: ${message.role}`);
    }
  }

  async sendMessage(messages: ChatMessage[]): Promise<string> {
    try {
      // Convert messages to LangChain format
      const langchainMessages = messages.map(msg => this.convertToLangChainMessage(msg));
      
      // Get response from model
      const response = await this.model.invoke(langchainMessages);
      
      // Return the content
      return response.content as string;
    } catch (error) {
      console.error('Error sending message to LangChain:', error);
      throw error;
    }
  }

  async streamMessage(messages: ChatMessage[], onToken: (token: string) => void): Promise<void> {
    try {
      const langchainMessages = messages.map(msg => this.convertToLangChainMessage(msg));
      
      const stream = await this.model.stream(langchainMessages);
      
      for await (const chunk of stream) {
        if (chunk.content) {
          onToken(chunk.content as string);
        }
      }
    } catch (error) {
      console.error('Error streaming message from LangChain:', error);
      throw error;
    }
  }

  // Create a chat pipeline with memory
  async createChatPipeline(systemPrompt: string) {
    const prompt = ChatPromptTemplate.fromMessages([
      ["system", systemPrompt],
      ["placeholder", "{history}"],
      ["human", "{input}"],
    ]);

    const outputParser = new StringOutputParser();
    
    const chain = prompt.pipe(this.model).pipe(outputParser);
    
    return chain;
  }
}

// Export a singleton instance for server-side use only
let langchainService: LangChainService | null = null;

export const getLangChainService = () => {
  if (!langchainService && typeof window === 'undefined') {
    langchainService = new LangChainService();
  }
  return langchainService;
};
