<template>
    <div class="container mx-auto p-8 bg-gray-100 min-h-screen">
        <h1 class="text-5xl font-extrabold text-center mb-12 text-blue-700 leading-tight">
            Sua Galeria de Jogos Incrível
        </h1>
        <!--Botões de Ação Global -->
        <div class="flex justify-center space-x-4 mb-10">
            <button @click="showFilterOptions"
                class="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-colors duration-200 text-lg">
                Filtrar Jogos
            </button>
            <button @click="addNewGames"
                class="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-colors duration-200 text-lg">
                Adicionar Novo Jogo
            </button>
        </div>
        <!-- Seção da Galeria de Jogos-->
        <div v-if="games.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-col-3 xl:grid-cols-4 gap-8">
            <GameCard v-for="game in games" :key="game.id" :game="game" @view-details="handleViewDetails"
                @toggle-favorite="handleToggleFavorite" />
        </div>
        <div v-else class="text-center text-xl text-gray-600 mt-16">
            Nenhum jogo encontrado. Que tal adicionar um novo ?
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import GameCard from '@/components/GameCard.vue';
import type { Game } from '@/types/games';

const allGames = ref<Game[]>([]);
const filteredGames = ref<Game[]>([]);

const showFilter = ref(false);
const selectedGenre = ref<string>('');
const selectedYear = ref<number| null>(null);

const router = useRouter();
const games = ref<Game[]>([]);

const fetchGames = async () => {
    await new Promise(resolve => setTimeout(resolve, 500));

    games.value = [
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
};

onMounted(() => {
    fetchGames();
});

const showFilterOptions = () => {
    alert('Funcionalidade de filtrar jogos será implementada aqui!');
};

const addNewGames = () => {
    alert('Funcionalidade de adicionar novo jogo.');
}

const handleViewDetails = (gameId: number) => {
    router.push(`/games/${gameId}`);
}

const handleToggleFavorite = (gameId: number) => {
    const game = games.value.find(game => game.id === gameId);
    if (game) {
        game.isFavorite = !game.isFavorite;
        alert(`Jogo com ID ${gameId} teve o status de favorito alterado para ${game.isFavorite}`);
    }
}



</script>