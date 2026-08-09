<script setup>
import { computed } from 'vue'
import { useConfigStore } from '@/stores/configStore'
import { getWeatherIconUrl } from '@/utils/weatherFormat'

const props = defineProps({
  // 3시간 간격 예보 배열. { time, temp, icon, status, pop } 형태.
  // 이름을 slots로 두면 Vue의 <slot> 기능과 헷갈리므로 entries로 부른다.
  entries: {
    type: Array,
    default: () => [],
  },
})

const configStore = useConfigStore()

/**
 * 막대 높이를 계산하기 위한 기준값.
 *
 * 절대 온도로 높이를 정하면(예: 30도 = 30%) 하루 사이 기온 차가 작을 때
 * 막대가 전부 비슷해져서 변화가 보이지 않는다.
 * 그래서 이 구간의 최저/최고를 양 끝으로 삼아 상대적으로 그린다.
 */
const tempRange = computed(() => {
  const temps = props.entries.map((slot) => slot.temp)
  const min = Math.min(...temps)
  const max = Math.max(...temps)
  // 모든 값이 같으면 max - min이 0이 되어 0으로 나누게 된다. 그때는 1로 둔다.
  return { min, span: max - min === 0 ? 1 : max - min }
})

// 최저 기온도 막대가 보이도록 바닥을 20%로 두고 나머지 80%를 변화폭에 배정한다.
const getBarHeight = (temp) => {
  const ratio = (temp - tempRange.value.min) / tempRange.value.span
  return `${20 + ratio * 80}%`
}

// 화면 표시는 항상 현재 단위 설정을 따른다. (원본은 섭씨)
const toDisplayTemp = (temp) => configStore.convertTemp(temp)

// '오후 3시'처럼 시간만 보여준다. 날짜는 아래 별도 줄에서 구분한다.
const formatHour = (time) => time.toLocaleTimeString('ko-KR', { hour: 'numeric' })

// 자정을 넘어가는 지점에만 날짜를 표시해 며칠치인지 알 수 있게 한다.
const isDayStart = (index) => {
  if (index === 0) return true
  return props.entries[index].time.getDate() !== props.entries[index - 1].time.getDate()
}

const formatDay = (time) => time.toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' })
</script>

<template>
  <div class="forecast-chart">
    <div
      v-for="(slot, index) in entries"
      :key="slot.time.getTime()"
      class="forecast-slot"
    >
      <span class="slot-day">{{ isDayStart(index) ? formatDay(slot.time) : '' }}</span>

      <span class="slot-temp">
        {{ toDisplayTemp(slot.temp) }}{{ configStore.unitSymbol }}
      </span>

      <!-- 기온 막대. 높이는 이 구간의 최저~최고 사이에서 상대적으로 정해진다. -->
      <div class="bar-track">
        <div
          class="bar-fill"
          :style="{ height: getBarHeight(slot.temp) }"
        />
      </div>

      <img
        class="slot-icon"
        :src="getWeatherIconUrl(slot.icon)"
        :alt="slot.status"
        loading="lazy"
      >

      <!-- 강수확률은 0%일 때 표시하면 시선만 뺏으므로 값이 있을 때만 보여준다 -->
      <span
        class="slot-pop"
        :class="{ 'is-hidden': slot.pop === 0 }"
      >
        💧{{ slot.pop }}%
      </span>

      <span class="slot-hour">{{ formatHour(slot.time) }}</span>
    </div>
  </div>
</template>

<style scoped>
.forecast-chart {
  display: flex;
  gap: 2px;
  justify-content: space-between;
  padding: 8px 4px;
  overflow-x: auto;
}

.forecast-slot {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  min-width: 46px;
}

.slot-day {
  height: 13px;
  font-size: 10px;
  font-weight: bold;
  color: #409eff;
}

.slot-temp {
  font-size: 11px;
  font-weight: bold;
  color: #303133;
}

.bar-track {
  display: flex;
  align-items: flex-end;
  height: 56px;
}

.bar-fill {
  width: 10px;
  background: linear-gradient(to top, #409eff, #79bbff);
  border-radius: 3px 3px 0 0;
}

.slot-icon {
  width: 32px;
  height: 32px;
}

.slot-pop {
  font-size: 10px;
  color: #409eff;
}

/* 자리는 유지하고 보이지만 않게 한다. display:none으로 지우면 칸마다 높이가 달라져 줄이 어긋난다. */
.slot-pop.is-hidden {
  visibility: hidden;
}

.slot-hour {
  font-size: 10px;
  color: #909399;
}
</style>
