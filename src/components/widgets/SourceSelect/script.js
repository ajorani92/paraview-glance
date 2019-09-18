import ProxyManagerMixin from 'paraview-glance/src/mixins/ProxyManagerMixin';

// ----------------------------------------------------------------------------

function sourceToItem(s) {
  return {
    name: s.getName(),
    proxyId: s.getProxyId(),
  };
}

// ----------------------------------------------------------------------------

export default {
  name: 'SourceSelect',
  mixins: [ProxyManagerMixin],
  props: {
    filterFunc: {
      type: Function,
      default: () => () => true,
    },
    label: {
      type: String,
      default: () =>  '',
    },
    bindToActiveSource: {
      type: Boolean,
      default: () => false,
    },
    value: {
      type: Number,
      default: () => -1,
    },
  },
  data() {
    return {
      internalValue: -1,
    };
  },
  computed: {
    selection() {
      const source = this.proxyManager.getProxyById(this.internalValue);
      if (source && source.getProxyGroup() === 'Sources') {
        return sourceToItem(source);
      }
      return null;
    },
  },
  watch: {
    value(value) {
      this.internalValue = value;
    },
  },
  mounted() {
    const source = this.proxyManager.getActiveSource();
    if (source) {
      this.internalValue = source.getProxyId();
      this.$nextTick(() => this.$emit('input', this.internalValue));
    }
  },
  proxyManager: {
    onActiveSourceChange(source) {
      if (this.bindToActiveSource) {
        if (source.getProxyId() !== this.internalValue) {
          this.internalValue = source.getProxyId();
          this.$emit('input', this.internalValue);
        }
      }
    },
    onProxyRegistrationChange(info) {
      const { proxyGroup, action, proxyId } = info;
      if (proxyGroup === 'Sources') {
        if (action === 'unregister' && this.internalValue === proxyId) {
          this.internalValue = -1;
          this.$emit('input', this.internalValue);
        }
        // re-render select list
        this.$forceUpdate();
      }
    },
  },
  methods: {
    getSources() {
      const sources = this.proxyManager
        .getSources()
        .filter((s) => this.filterFunc(s));

      return sources.map((s) => sourceToItem(s));
    },
    makeSelection(sourceId) {
      if (sourceId !== this.internalValue) {
        if (this.bindToActiveSource) {
          const s = this.proxyManager.getProxyById(sourceId);
          if (s) {
            this.proxyManager.setActiveSource(s);
          }
        }
        this.$emit('input', sourceId);
      }
    },
  },
};
