import express, { Express } from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { mockAuthMiddleware } from './middlewares/mock-auth.middleware.js';
import { errorHandler } from './middlewares/error.middleware.js';
import { swaggerSpec } from './security/swagger.js';
import apiRoutes from './routes/index.js';

const app: Express = express();

app.use(cors());
app.use(express.json());

// Activer le middleware d'authentification fictif sur l'ensemble de l'API
app.use(mockAuthMiddleware);

// Route de documentation Swagger accessible à tous
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Route de bienvenue publique pour s'assurer que l'API tourne
app.get('/', (_req, res) => {
    res.json({
        message: 'Bienvenue sur l\'API de démonstration next-rbac !',
        documentation: 'Accédez à la documentation interactive Swagger sur http://localhost:4000/api-docs',
        instructions: 'Utilisez le bouton "Authorize" sur Swagger en saisissant "1" (Viewer), "2" (Editor) ou "3" (Admin) pour tester les permissions.'
    });
});

// Monter l'arbre de routes de l'API
app.use('/api', apiRoutes);

// Gestion d'erreurs globales
app.use(errorHandler);

export default app;