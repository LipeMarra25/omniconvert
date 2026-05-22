export function getItem(key, fallback = null) {
    const raw = localStorage.getItem(key);

    if (!raw) {
        return fallback;
    }

    try {
        return JSON.parse(raw);
    } catch {
        // Se o valor salvo estiver corrompido ou não for um JSON válido, retornamos o valor de fallback.
        // evitamos quebrar o app e retornamos o valor padrão.
        return fallback;
    }
}

// Salva qualquer valor JavaScript no localStorage.
// Como o localStorage só aceita texto, transformamos o valor em JSON.
export function setItem(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

// Remove um valor salvo no localStorage.
// Útil para logout, limpar histórico, remover favoritos etc.
export function removeItem(key) {
    localStorage.removeItem(key);
}