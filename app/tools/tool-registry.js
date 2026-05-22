// Grupos principais de ferramentas dentro da plataforma.
// Isso ajuda a organizar sidebar, dashboard, filtros e permissões.
export const TOOL_GROUPS = {
    CONVERTER: "Converter",
    DEV_TOOLS: "Dev Tools",
    CALCULATORS: "Calculators",
    DATA_TOOLS: "Data Tools"
};

// Catálogo oficial de ferramentas do OmniConvert.
// A ideia é que a UI leia essa lista para montar cards, menus e permissões.
export const tools = [
    {
        // ID único da ferramenta.
        // Esse valor deve ser estável, porque pode ser usado em histórico, favoritos e rotas.
        id: "universal-converter",
        

        // Nome exibido para o usuário.
        name: "Universal Converter",

        // Grupo onde a ferramenta se encaixa.
        group: TOOL_GROUPS.CONVERTER,

        // Descrição curta para cards, busca e onboarding.
        description: "Convert units, currencies, data and scientific values.",

        // Define se a ferramenta exige acesso premium (Plus) ou é liberada para todos os usuários (Free).
        premium: false
    },
    {
        id: "json-formatter",
        name: "JSON Formatter",
        group: TOOL_GROUPS.DEV_TOOLS,
        description: "Format and validate JSON.",
        premium: false
    },
    {
        id: "jwt-decoder",
        name: "JWT Decoder",
        group: TOOL_GROUPS.DEV_TOOLS,
        description: "Decode JWT tokens.",

        // Essa ferramenta começa como premium/future-ready
        // Depois vou bloquear para usuários Free e deixar só para Plus.
        premium: true
    }
];