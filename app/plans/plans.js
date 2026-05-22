// Nomes oficiais dos planos do produto.
// Usar constantes evita erro de digitação, tipo "free", "FREE", "Frre" etc.
export const PLANS = {
    FREE: "Free",
    PLUS: "Plus"
};

// Regras de cada plano.
// Aqui concentramos o que cada plano pode ou não pode fazer.

export const PLAN_LIMITS = {
    Free: {
        // Quantas ações/conversões o usuário Free pode fazer por dia.
        dailyUsage: 20,
        // Quantos itens de histórico o usuário Free pode guardar.
        history: 20,
        // Quantos itens o usuário Free pode marcar como favorito.
        favorites: Infinity,
        // Se o plano Free pode acessar ferramentas premium.
        premiumTools: false
        
    },
    Plus: {
        // Quantas ações/conversões o usuário Plus pode fazer por dia.
        dailyUsage: Infinity,
        // Quantos itens de histórico o usuário Plus pode guardar.
        history: Infinity,
        // Quantos itens o usuário Plus pode marcar como favorito.
        favorites: Infinity,
        // Se o plano Plus pode acessar ferramentas premium.
        premiumTools: true,

        
    }
}