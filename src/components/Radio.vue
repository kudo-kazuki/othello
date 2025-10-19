<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
    id: string
    name?: string
    text: number | string
    value: number | string | boolean
    modelValue: number | string | boolean
    isDisabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {})

const emit = defineEmits(['update:modelValue'])

const localModelValue = ref(props.modelValue)

watch(
    () => props.modelValue,
    (newValue) => {
        localModelValue.value = newValue
    },
)

watch(
    () => localModelValue.value,
    (newValue) => {
        emit('update:modelValue', newValue)
    },
)
</script>

<template>
    <div class="Radio" :class="{ 'Radio--disabled': isDisabled }">
        <input
            class="Radio__input"
            :class="{ 'Radio__input--disabled': isDisabled }"
            :id="id"
            type="radio"
            :name="name"
            :value="value"
            v-model="localModelValue"
        />
        <label class="Radio__label" :for="id">{{ text }}</label>
    </div>
</template>

<style scoped lang="scss">
.Radio {
    line-height: 0;

    &__input {
        display: none;

        &--disabled {
            pointer-events: none;
        }
    }

    &__input:checked + &__label {
        &:before {
            border-color: rgb(51, 122, 183);
            animation: ripple 0.2s linear forwards;
        }

        &:after {
            transform: scale(1);
        }
    }

    &__input--disabled:checked + &__label {
        &:before {
            border-color: #999;
        }
    }

    &__label {
        display: inline-flex;
        align-items: center;
        line-height: 1;
        position: relative;
        cursor: pointer;

        &:before,
        &:after {
            content: '';
            border-radius: 50%;
            transition: all 0.3s ease;
            transition-property: transform, border-color;
        }

        &:before {
            width: 22px;
            height: 22px;
            border: 2px solid rgba(0, 0, 0, 0.54);
            margin-right: 5px;
            box-sizing: border-box;
        }

        &:after {
            position: absolute;
            top: 50%;
            left: 5px;
            width: 12px;
            height: 12px;
            margin-top: -6px;
            transform: scale(0);
            background: rgb(51, 122, 183);
        }
    }

    &--disabled &__label {
        pointer-events: none;
        color: #999;

        &::before {
            border-color: #999;
        }

        &:after {
            background-color: #999;
        }
    }
}

@keyframes ripple {
    0% {
        box-shadow: 0px 0px 0px 1px rgba(0, 0, 0, 0);
    }
    50% {
        box-shadow: 0px 0px 0px 15px rgba(0, 0, 0, 0.1);
    }
    100% {
        box-shadow: 0px 0px 0px 15px rgba(0, 0, 0, 0);
    }
}
</style>
