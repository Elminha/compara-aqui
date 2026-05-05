// server/mlApi.ts - VERSÃO COM DADOS MOCKADOS (para teste)
// Depois substituímos pela API real

export const CATEGORIAS = {
  CELULARES: 'MLB1055',
  ELETRONICOS: 'MLB1000',
  NOTEBOOKS: 'MLB1649',
  TVS: 'MLB1002'
};

// Dados mockados de produtos (simulando resposta da API)
const produtosMock = [
  {
    id: 'mock-1',
    title: 'iPhone 14 Pro Max 256GB - Deep Purple',
    price: 6799,
    original_price: 7999,
    thumbnail: 'https://http2.mlstatic.com/D_NQ_NP_2X_123456-MLA12345678901-F.webp',
    seller: { nickname: 'Apple Store BR' },
    permalink: '#',
    condition: 'new',
    sold_quantity: 1250,
    shipping: { free_shipping: true },
    installments: { quantity: 12, amount: 566.58 }
  },
  {
    id: 'mock-2',
    title: 'Samsung Galaxy S23 Ultra 512GB - Verde',
    price: 5899,
    original_price: 6999,
    thumbnail: 'https://http2.mlstatic.com/D_NQ_NP_2X_234567-MLA12345678902-F.webp',
    seller: { nickname: 'Samsung Oficial' },
    permalink: '#',
    condition: 'new',
    sold_quantity: 890,
    shipping: { free_shipping: true },
    installments: { quantity: 10, amount: 589.90 }
  },
  {
    id: 'mock-3',
    title: 'Notebook Dell Inspiron 15 - Intel Core i7 - 16GB RAM',
    price: 4599,
    original_price: 5499,
    thumbnail: 'https://http2.mlstatic.com/D_NQ_NP_2X_345678-MLA12345678903-F.webp',
    seller: { nickname: 'Dell Brasil' },
    permalink: '#',
    condition: 'new',
    sold_quantity: 342,
    shipping: { free_shipping: false },
    installments: { quantity: 12, amount: 383.25 }
  },
  {
    id: 'mock-4',
    title: 'Smart TV LG 55" 4K UHD - WebOS 23',
    price: 2899,
    original_price: 3499,
    thumbnail: 'https://http2.mlstatic.com/D_NQ_NP_2X_456789-MLA12345678904-F.webp',
    seller: { nickname: 'LG Eletronics' },
    permalink: '#',
    condition: 'new',
    sold_quantity: 567,
    shipping: { free_shipping: true },
    installments: { quantity: 12, amount: 241.58 }
  },
  {
    id: 'mock-5',
    title: 'PlayStation 5 - 825GB - Standard Edition',
    price: 4399,
    original_price: 4999,
    thumbnail: 'https://http2.mlstatic.com/D_NQ_NP_2X_567890-MLA12345678905-F.webp',
    seller: { nickname: 'Sony Brasil' },
    permalink: '#',
    condition: 'new',
    sold_quantity: 2340,
    shipping: { free_shipping: true },
    installments: { quantity: 12, amount: 366.58 }
  }
];

export async function buscarProdutosML(termo: string, limite: number = 30) {
  console.log(`🔍 Buscando mockado: ${termo}`);
  
  // Simula delay de rede
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Filtra por termo de busca
  let resultados = produtosMock;
  if (termo && termo !== 'smartphone') {
    resultados = produtosMock.filter(p => 
      p.title.toLowerCase().includes(termo.toLowerCase())
    );
  }
  
  const limitado = resultados.slice(0, limite);
  
  const produtos = limitado.map(produto => ({
    id: produto.id,
    nome: produto.title,
    preco: produto.price,
    precoOriginal: produto.original_price,
    imagem: produto.thumbnail,
    imagemAlta: produto.thumbnail,
    loja: produto.seller.nickname,
    link: produto.permalink,
    condicao: produto.condition === 'new' ? 'Novo' : 'Usado',
    vendidos: produto.sold_quantity,
    freteGratis: produto.shipping.free_shipping,
    aceitaParcelamento: !!produto.installments,
    parcelas: produto.installments ? {
      quantidade: produto.installments.quantity,
      valor: produto.installments.amount
    } : null
  }));
  
  console.log(`✅ Encontrados ${produtos.length} produtos (mockados)`);
  return produtos;
}

export async function buscarProdutoPorIdML(id: string) {
  console.log(`🔍 Buscando produto mockado: ${id}`);
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const produto = produtosMock.find(p => p.id === id) || produtosMock[0];
  
  return {
    id: produto.id,
    nome: produto.title,
    preco: produto.price,
    precoOriginal: produto.original_price,
    imagemPrincipal: produto.thumbnail,
    todasImagens: [produto.thumbnail],
    descricao: `Este é um produto de teste para o Compara Aqui. Em breve integraremos com a API real do Mercado Livre. ${produto.title} é um produto de alta qualidade com excelentes avaliações.`,
    condicao: 'Novo',
    quantidadeDisponivel: 50,
    vendidos: produto.sold_quantity,
    loja: {
      nome: produto.seller.nickname,
      id: '12345',
      reputacao: 'gold'
    },
    link: '#',
    garantia: '12 meses de garantia',
    freteGratis: produto.shipping.free_shipping,
    aceitaParcelamento: true,
    melhorParcela: {
      quantidade: 12,
      valor: produto.price / 12,
      total: produto.price
    },
    categoria: 'MLB1055',
    atributos: [
      { nome: 'Marca', valor: produto.title.split(' ')[0] },
      { nome: 'Condição', valor: 'Novo' },
      { nome: 'Garantia', valor: '12 meses' }
    ]
  };
}

export async function buscarPorCategoriaML(categoriaId: string, limite: number = 30) {
  console.log(`📂 Buscando categoria mockada: ${categoriaId}`);
  const produtos = produtosMock.slice(0, limite).map(p => ({
    id: p.id,
    nome: p.title,
    preco: p.price,
    imagem: p.thumbnail,
    loja: p.seller.nickname,
    link: p.permalink
  }));
  return produtos;
}