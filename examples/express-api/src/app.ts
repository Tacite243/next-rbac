import express from 'express';
import cors from 'cors';
import { mockAuthMiddleware } from './middlewares/mock-auth.middleware.js';
import { errorHandler } from './middlewares/error.middleware.js';
import apiRoutes from './routes/index.js';

const app = express();

app.use(cors());
app.use(express.json());

// Activer notre middleware d'authentification fictif sur l'ensemble de l'API
app.use(mockAuthMiddleware);

// Route de bienvenue publique pour s'assurer que l'API tourne
app.get('/', (req, res) => {
    res.json({
        message: 'Bienvenue sur l\'API de démonstration next-rbac !',
        instructions: 'Utilisez l\'en-tête "X-User-Id" avec les valeurs "1" (Viewer), "2" (Editor) ou "3" (Admin) pour tester les permissions.'
    });
});

// Monter l'arbre de routes de l'API
app.use('/api', apiRoutes);

// Gestion d'erreurs globales
app.use(errorHandler);

export default app;