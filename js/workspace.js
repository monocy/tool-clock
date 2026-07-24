const ToolWorkspace = {
  props: {
    settings: { type: Object, required: true },
    translations: { type: Object, required: true }
  },
  template: `
    <!-- Clock Main Panel -->
    <div class="w-full glass-panel p-8 sm:p-12 rounded-3xl neon-shadow flex flex-col items-center relative overflow-hidden max-w-2xl">
      <!-- Clock Face -->
      <div class="flex flex-col items-center select-none">
        <!-- Date -->
        <div class="text-sm sm:text-base font-semibold tracking-[0.25em] text-[var(--text-muted)] uppercase mb-3">
          {{ dateString }}
        </div>
        <!-- Digital Time -->
        <div class="text-6xl sm:text-8xl font-black font-mono-custom tracking-wider tabular-nums leading-none transition duration-300"
             :style="{ color: 'var(--accent-color)', textShadow: 'var(--accent-glow-intensity)' }">
          {{ timeString }}
        </div>
        <!-- AM/PM & Seconds -->
        <div class="flex items-center gap-3 mt-4">
          <span class="text-xs sm:text-sm font-bold tracking-[0.3em] uppercase px-3 py-1 bg-[var(--bg-card)] rounded-md border border-[var(--border-color)] text-[var(--text-muted)]">
            {{ period }}
          </span>
          <span class="text-lg sm:text-xl font-bold font-mono-custom tabular-nums text-[var(--text-muted)]">
            : {{ seconds }}
          </span>
        </div>
      </div>

      <!-- Progress Indicator -->
      <div class="w-full bg-[var(--bg-card)] h-1.5 mt-10 rounded-full overflow-hidden border border-slate-900/50">
        <div class="h-full bg-[var(--accent-color)] transition-all duration-100 ease-linear shadow-[0_0_10px_var(--accent-color)]"
             :style="{ width: progressPercent + '%' }"></div>
      </div>
    </div>
  `,
  setup(props) {
    const { ref, computed, onMounted, onUnmounted } = Vue;

    const t = (key, fallback = '') => {
      const parts = key.split('.');
      const currentLang = props.settings.lang;
      const trans = props.translations ? (props.translations.value || props.translations) : {};
      let current = trans[currentLang];
      if (!current) return fallback || key;
      for (const part of parts) {
        current = current[part];
        if (current === undefined) return fallback || key;
      }
      return current;
    };

    const now = ref(new Date());
    let timer = null;

    const updateTime = () => {
      now.value = new Date();
    };

    const timeString = computed(() => {
      const h = String(now.value.getHours()).padStart(2, '0');
      const m = String(now.value.getMinutes()).padStart(2, '0');
      return `${h}:${m}`;
    });

    const seconds = computed(() => {
      return String(now.value.getSeconds()).padStart(2, '0');
    });

    const period = computed(() => {
      return now.value.getHours() >= 12 ? t('pm') : t('am');
    });

    const dateString = computed(() => {
      const y = now.value.getFullYear();
      const m = String(now.value.getMonth() + 1).padStart(2, '0');
      const d = String(now.value.getDate()).padStart(2, '0');
      const dayNames = [t('sun'), t('mon'), t('tue'), t('wed'), t('thu'), t('fri'), t('sat')];
      const day = dayNames[now.value.getDay()];
      return `${y}/${m}/${d} (${day})`;
    });

    const progressPercent = computed(() => {
      const sec = now.value.getSeconds();
      const ms = now.value.getMilliseconds();
      return ((sec + ms / 1000) / 60) * 100;
    });

    onMounted(() => {
      timer = setInterval(updateTime, 250);
    });

    onUnmounted(() => {
      if (timer) clearInterval(timer);
    });

    return {
      t,
      timeString,
      seconds,
      period,
      dateString,
      progressPercent
    };
  }
};
