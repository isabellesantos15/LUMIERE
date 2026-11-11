
/*
  Responsável por:
  - Configurar as rotas do aplicativo
  - Aplicar o tema Azul Royal & Pérola
  - Definir a aparência das transições
  - Exibir a animação inicial
*/

import {
  DefaultTheme,
  Stack,
  ThemeProvider,
} from 'expo-router';

// Responsável pela tela de abertura do aplicativo.
import * as SplashScreen from 'expo-splash-screen';

// Animação inicial que já existe no projeto.
import { AnimatedSplashOverlay } from '@/components/animated-icon';

// Personaliza as cores do sistema de navegação.
const temaLumiere = {
  ...DefaultTheme,

  colors: {
    ...DefaultTheme.colors,

    // Cor principal do aplicativo.
    primary: '#244DA0',

    // Fundo usado pelo sistema de navegação.
    background: '#10234E',

    // Cor de fundo de cartões nativos.
    card: '#F5F7FC',

    // Cor dos textos.
    text: '#1A315C',

    // Cor das bordas.
    border: '#DCE5F4',

    // Cor dos indicadores.
    notification: '#648ED4',
  },
};

// Mantém a splash screen até ser liberada.
void SplashScreen.preventAutoHideAsync();

// Componente principal de navegação.
export default function RootLayout() {
  return (
    <ThemeProvider value={temaLumiere}>

      {/* Mantém a animação inicial do projeto. */}
      <AnimatedSplashOverlay />

      {/* Organiza a navegação entre as telas. */}
      <Stack
        screenOptions={{
          // Oculta o cabeçalho padrão.
          headerShown: false,

          // Anima a passagem entre as telas.
          animation: 'slide_from_right',

          // Evita fundo branco nas transições.
          contentStyle: {
            backgroundColor: '#10234E',
          },
        }}
      >
        {/* Tela inicial do LUMIÈRE. */}
        <Stack.Screen name="index" />

        {/* Tela de exploração de filmes. */}
        <Stack.Screen name="explore" />

        {/* Tela de cadastro de usuários. */}
        <Stack.Screen name="cadastro" />
      </Stack>
    </ThemeProvider>
  );
}
