// Mock API para testes locais
export const mockApiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

  // Simular delay de rede
  await delay(300)

  console.log("Mock API called:", endpoint, options.method)

  // Mock responses baseados no endpoint
  if (endpoint === "/add-lancamento" && options.method === "POST") {
    return new Response(JSON.stringify({ mensagem: "Lançamento adicionado com sucesso (MOCK)" }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    })
  }

  if (endpoint === "/favoritos" && options.method === "POST") {
    return new Response(JSON.stringify({ mensagem: "Favorito salvo com sucesso (MOCK)" }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    })
  }

  // GET /favoritos - sem body, email vem na query string
  if (endpoint === "/favoritos" && options.method === "GET") {
    const mockFavoritos = [
      {
        id: "1",
        type: "entrada",
        description: "Salário",
        value: 3000.0,
        category: "",
        payment_method: "",
      },
      {
        id: "2",
        type: "saida",
        description: "Supermercado",
        value: 150.0,
        category: "Alimentação",
        payment_method: "Cartão de débito",
      },
      {
        id: "3",
        type: "saida",
        description: "Combustível",
        value: 80.0,
        category: "Transporte",
        payment_method: "PIX",
      },
    ]

    return new Response(JSON.stringify({ resposta: mockFavoritos }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  }

  if (endpoint.startsWith("/favoritos/") && options.method === "DELETE") {
    return new Response(JSON.stringify({ mensagem: "Favorito removido com sucesso (MOCK)" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  }

  // Default response
  return new Response(JSON.stringify({ message: "Mock response" }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  })
}
