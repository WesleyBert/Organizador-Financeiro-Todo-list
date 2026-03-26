<template>
    <div
        class="bg-white rounded-lg shadow-xl overflow-hidden transform hover:scale-105 transition-all duration-300 ease-in-out">
        <img :src="game.image" :alt="game.title" class="w-full h-48 object-cover object-center" />
        <div class="p-6">
            <h3 class="text-2xl font-bold text-gray-800 mb-2"> {{ game.title }} </h3>
            <p class="text-gray-600 text-sm mb-4 line-clamp-3"> {{ game.description }}</p>
            <div class="flex items-center justify-between text-gray-700 text-sm mb-4">
                <span>Gênero: {{ game.genre }}</span>
                <span>Lançamento: {{ game.releaseYear }}</span>
            </div>
            <div class="flex justify-end space-x-3">
                <button @click="viewDetails"
                    class="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-full transition-colors duration-200">
                    Ver detalhes
                </button>
                <button
                @click="addToFavorites"
                    :class="[
                    game.isFavorite ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-400 hover:bg-gray-500',
                    'text-white font-semibold py-2 px-4 rounded-full transition-colors duration-200'
                ]" >
                    {{ game.isFavorite ? 'Remover Favorito' : 'Adicionar Favorito' }}
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import type { Game }  from '@/types/games';


const props = defineProps<{
    game: Game;
}>();

const emit = defineEmits(['viewDetails', 'toggleFavorite']);

const viewDetails = () => {
    emit('viewDetails', props.game.id);
};

const addToFavorites = () => {
    emit('toggleFavorite', props.game.id);
}

</script>
