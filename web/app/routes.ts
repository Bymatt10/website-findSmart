import {
    type RouteConfig,
    index,
    layout,
    route,
} from '@react-router/dev/routes';

export default [
    // Auth routes (no sidebar)
    layout('layouts/auth-layout.tsx', [
        route('login', 'routes/login.tsx'),
        route('register', 'routes/register.tsx'),
    ]),
    // App routes (with sidebar)
    layout('layouts/app-layout.tsx', [
        index('routes/home.tsx'),
        route('goals', 'routes/goals.tsx'),
        route('asistente', 'routes/asistente.tsx'),
        route('chat', 'routes/chat.tsx'),
        route('perfil', 'routes/perfil.tsx'),
        route('transactions', 'routes/transactions.tsx'),
    ]),
] satisfies RouteConfig;
