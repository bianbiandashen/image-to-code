import OpenAI from 'openai'
import { OpenAIStream, StreamingTextResponse } from 'ai'
import { USER_PROMPT, SYSTEM_PROMPT, SPEECH_PROMPT } from '@/app/constants/prompts'

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
	baseURL: process.env.OPENAI_BASE_URL, // 确认正确的配置项名称
})

export const runtime = 'edge'

export async function POST(req: Request) {
	const { prompt } = await req.json()

	const response = await openai.chat.completions.create({
		model: 'gpt-4-0613',
		stream: true,
		max_tokens: 4096,
		messages: [
			{
				role: 'system',
				content: SPEECH_PROMPT,
			},
			{
				role: 'user',
				content: prompt,
			},
		],
	})

	// 设置跨域头部
	const headers = new Headers({
		'Access-Control-Allow-Origin': '*',
		'Access-Control-Allow-Methods': 'POST, OPTIONS',
		'Access-Control-Allow-Headers': 'Content-Type',
		// 添加任何其他需要的CORS头部
	})

	// 检查是否预检请求
	if (req.method === 'OPTIONS') {
		return new Response(null, { status: 204, headers })
	}

	const stream = OpenAIStream(response)

	// 返回支持跨域的响应
	return new StreamingTextResponse(stream, { headers })
}
