<template>
    <div class="container mx-auto p-8 bg-gray-100 min-h-screen">
        <div v-if="game" class="max-w-4xl mx-auto">
            <button @click="goBack"
                class="mb-6 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200">
                ← Voltar para Galeria
            </button>
            <!--Card de Detalhes do Jogo-->
            <div class="bg-white rounded-lg shadow-xl overflow-hidden">
                <img :src="game.image" :alt="game.title" class="w-full h-96 object-cover" />
                <div class="p-8">
                    <h1 class="text-4xl font-bold text-gray-800 mb-4"> {{ game.title }} </h1>

                    <div class="flex items-center space-x-6 mb-6 text-gray-600">
                        <span class="text-lg">Gênero: <strong class="text-gray-800">{{ game.genre
                                }}</strong></span>
                        <span class="text-lg">Ano de Lançamento: <strong class="text-gray-800"> {{
                            game.releaseYear }}</strong></span>
                    </div>
                    <div class="mb-6">
                        <button @click="toggleFavorite" :class="[
                            game.isFavorite ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-400 hover:bg-gray-500',
                            'text-white font-semibold py-3 px-6 rounded-full transition-colors duration-200'
                        ]">
                            {{ game.isFavorite ? '❤️ Remover dos Favoritos' : '🤍 Adicionar aos Favoritos' }}
                        </button>
                    </div>
                    <div class="border-t pt-6">
                        <h2 class="text-2xl font-semibold text-gray-800 mb-4"> Sobre o Jogo</h2>
                        <p class="text-gray-700 text-lg leading-relaxed"> {{ game.description }}</p>
                    </div>
                </div>
            </div>
        </div>
        <div v-else class="text-center text-xl text-gray-600 mt-16">
            <p>Jogo não encontrado.</p>
            <button @click="goBack"
                class="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg">
                Voltar para Galeria
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { Game } from '@/types/games';

const route = useRoute();
const router = useRouter();
const game = ref<Game | null>(null);

const mockGames: Game[] = [
    {
        id: 1,
        title: 'Aventura Mística',
        description: 'Explore um mundo mágico cheio de criaturas fantásticas e segredos antigos. Descubra artefatos poderosos e salve o reino!',
        image: 'https://via.placeholder.com/400x250/FF5733/FFFFFF?text=Aventura',
        genre: 'RPG',
        releaseYear: 2023,
        isFavorite: false,
    },
    {
        id: 2,
        title: 'Corrida Estelar',
        description: 'Sinta a adrenalina das corridas intergalácticas. Personalize sua nave, desafie pilotos rivais e alcance a glória no universo.',
        image: 'https://via.placeholder.com/400x250/33FF57/FFFFFF?text=Corrida',
        genre: 'Corrida',
        releaseYear: 2022,
        isFavorite: true,
    },
    {
        id: 3,
        title: 'Mistério da Mansão',
        description: 'Resolva um intrigante caso de assassinato em uma mansão sombria. Colete pistas, interrogue suspeitos e desvende a verdade oculta.',
        image: 'https://via.placeholder.com/400x250/3357FF/FFFFFF?text=Mistério',
        genre: 'Puzzle',
        releaseYear: 2021,
        isFavorite: false,
    },
    {
        id: 4,
        title: 'Guerra dos Clãs',
        description: 'Construa seu império, treine seu exército e domine seus inimigos em batalhas épicas. A estratégia é a chave para a vitória!',
        image: 'https://via.placeholder.com/400x250/FF33CC/FFFFFF?text=Estratégia',
        genre: 'Estratégia',
        releaseYear: 2024,
        isFavorite: false,
    },
];

onMounted(() => {
    const gameId = Number(route.params.id);
    game.value = mockGames.find(g => g.id === gameId) || null;
});

const goBack = () => {
    router.push('/');
}

const toggleFavorite = () => {
    if (game.value) {
        game.value.isFavorite = !game.value.isFavorite;
    }
}

</script>
