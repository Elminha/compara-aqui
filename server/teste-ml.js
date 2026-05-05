// server/teste-ml.js
async function testar() {
  const { buscarProdutosML } = await import('./mlApi.ts');
  
  try {
    console.log('Testando conexão com Mercado Livre...');
    const produtos = await buscarProdutosML('smartphone', 5);
    console.log(`✅ Sucesso! Encontrou ${produtos.length} produtos`);
    console.log('Primeiro produto:', produtos[0]?.nome);
    console.log('Preço:', produtos[0]?.preco);
  } catch (error) {
    console.error('❌ Falha:', error.message);
  }
}

testar();