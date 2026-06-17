import app from './app.js';

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`🚀 Serveur de démonstration démarré sur http://localhost:${PORT}`);
    console.log(`💡 Utilisez l'en-tête de requête "X-User-Id" pour usurper l'identité d'un utilisateur de test :`);
    console.log(`   - "X-User-Id: 1" pour Alice (Rôle: viewer)`);
    console.log(`   - "X-User-Id: 2" pour Bob (Rôle: editor)`);
    console.log(`   - "X-User-Id: 3" pour Charlie (Rôle: admin)`);
});