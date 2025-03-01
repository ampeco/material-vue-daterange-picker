/*!
 * v-md-date-range-picker v0.0.6
 * (c) 2019-present ly525 <lantern.done@gmail.com>
 */
import moment from 'moment';

//

function clean(momentDate) {
  /* eslint-disable */
  return momentDate.clone().hour(0).minute(0).second(0).millisecond(0);
} // _.range([start=0], end, [step=1])


function range(start = 0, end, step = 1) {
  const arr = [];
  start = +start;
  end = +end;

  for (let i = start; i <= end; i += step) {
    arr.push(i);
  }

  return arr;
}

var script = {
  name: 'calendar',
  inject: ['picker'],
  props: ['location', 'calendarMonth', 'locale', 'start', 'end'],
  methods: {
    dayClass(date) {
      const dt = date.clone();
      const cleanDt = clean(dt.clone());
      const cleanToday = clean(moment());
      const cleanStart = clean(this.start);
      const cleanEnd = clean(this.end);
      const hoverStart = clean(this.picker.hoverStart_);
      const hoverEnd = clean(this.picker.hoverEnd_);
      return {
        off: dt.month() !== this.month,
        // TODO what isoWeekday means ??
        weekend: dt.isoWeekday() > 5,
        today: cleanDt.isSame(cleanToday),
        // dt === start || dt === end
        active: cleanDt.isSame(cleanStart) || cleanDt.isSame(cleanEnd),
        //  start <= dt <= end || hoverStart <= dt <= hoverEnd
        // 当第一次点击(确认了 start )之后，此时 endDate === startDate，鼠标 hover 和 click 都需要显示一个范围
        'in-range': dt >= cleanStart && dt <= cleanEnd || dt >= hoverStart && dt <= hoverEnd,
        'start-date': cleanDt.isSame(cleanStart),
        'end-date': cleanDt.isSame(cleanEnd)
      };
    }

  },
  computed: {
    arrowLeftClass() {
      return 'arrow-left v-drp__css-icon';
    },

    arrowRightClass() {
      return 'arrow-right v-drp__css-icon';
    },

    // { Number } the month value for current calendar
    month() {
      return this.calendarMonth.month();
    },

    // TODO 这种有有依赖关系的 computed 是怎么处理的？
    monthName() {
      return this.locale.monthNames[this.month];
    },

    year() {
      return this.calendarMonth.year();
    },

    /**
     * TODO 这是一个数组，computed 数组的值 变化的时候，template 是怎么知道更新的呢
     */
    calendar() {
      // Build the matrix of dates that will populate the calendar
      const calendarMonth = this.calendarMonth;
      const month = calendarMonth.month();
      const year = calendarMonth.year();
      const hour = calendarMonth.hour();
      const minute = calendarMonth.minute();
      const second = calendarMonth.second();
      const daysInMonth = moment([year, month]).daysInMonth();
      const firstDay = moment([year, month, 1]);
      const lastDay = moment([year, month, daysInMonth]);
      const lastMonth = moment(firstDay).subtract(1, 'month').month();
      const lastYear = moment(firstDay).subtract(1, 'month').year();
      const daysInLastMonth = moment([lastYear, lastMonth]).daysInMonth();
      const dayOfWeek = firstDay.day(); // initialize a 6 rows x 7 columns array for the calendar

      const calendar = [];
      calendar.firstDay = firstDay;
      calendar.lastDay = lastDay;

      for (let i = 0; i < 6; i++) {
        calendar[i] = [];
      } // populate the calendar with date objects
      // 确定 6 * 7 日历中的第一天


      let startDay = daysInLastMonth - dayOfWeek + this.locale.firstDay + 1; // 2015-02-01，该月第一天是周日，此时 startDay > daysInLastMonth
      // https://user-images.githubusercontent.com/12668546/51437731-43104280-1cdd-11e9-82ae-9c270144b2a9.png

      if (startDay > daysInLastMonth) {
        startDay -= 7;
      }

      if (dayOfWeek === this.locale.firstDay) {
        startDay = daysInLastMonth - 6;
      }

      let curDate = moment([lastYear, lastMonth, startDay, 12, minute, second]);

      for (let i = 0, col = 0, row = 0; i < 42; i++, col++, curDate = moment(curDate).add(24, 'hour')) {
        if (i > 0 && col % 7 === 0) {
          col = 0;
          row++;
        }

        calendar[row][col] = curDate.clone().hour(hour).minute(minute).second(second);
        curDate.hour(12); // check for minDate and maxDate
        // if (this._minDate && calendar[row][col].format('YYYY-MM-DD') === this._minDate.format('YYYY-MM-DD') && calendar[row][col].isBefore(this._minDate) && side === 'left') {
        //   calendar[row][col] = this._minDate.clone();
        // }
        // if (this._maxDate && calendar[row][col].format('YYYY-MM-DD') === this._maxDate.format('YYYY-MM-DD') && calendar[row][col].isAfter(this._maxDate) && side === 'right') {
        //   calendar[row][col] = this._maxDate.clone();
        // }
      }

      return calendar;
    },

    // if show year select
    RangeOfYear() {
      if (!this.picker.showYearSelect) return []; // TODO 这边因为依赖计算属性：this.calendar 那么是否需要处理 this.calendar[1]为空的情况？
      // const currentYear = this.calendar[1][1].year();

      const picker = this.picker;
      const maxYear = picker.maxDate && picker.maxDate.year() || picker.maxYear;
      const minYear = picker.minDate && picker.minDate.year() || picker.minYear;
      return range(minYear, maxYear, 1);
    },

    activeYear: {
      get() {
        return this.calendarMonth.year();
      },

      set(newYear) {
        const calendarMonth = moment([newYear, this.month]);
        this.$emit('clickYearSelect', {
          location: this.location,
          calendarMonth
        });
      }

    }
  },
  filters: {
    dateNum(value) {
      return value.date();
    }

  }
};

function normalizeComponent(template, style, script, scopeId, isFunctionalTemplate, moduleIdentifier
/* server only */
, shadowMode, createInjector, createInjectorSSR, createInjectorShadow) {
  if (typeof shadowMode !== 'boolean') {
    createInjectorSSR = createInjector;
    createInjector = shadowMode;
    shadowMode = false;
  } // Vue.extend constructor export interop.


  var options = typeof script === 'function' ? script.options : script; // render functions

  if (template && template.render) {
    options.render = template.render;
    options.staticRenderFns = template.staticRenderFns;
    options._compiled = true; // functional template

    if (isFunctionalTemplate) {
      options.functional = true;
    }
  } // scopedId


  if (scopeId) {
    options._scopeId = scopeId;
  }

  var hook;

  if (moduleIdentifier) {
    // server build
    hook = function hook(context) {
      // 2.3 injection
      context = context || // cached call
      this.$vnode && this.$vnode.ssrContext || // stateful
      this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext; // functional
      // 2.2 with runInNewContext: true

      if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
        context = __VUE_SSR_CONTEXT__;
      } // inject component styles


      if (style) {
        style.call(this, createInjectorSSR(context));
      } // register component module identifier for async chunk inference


      if (context && context._registeredComponents) {
        context._registeredComponents.add(moduleIdentifier);
      }
    }; // used by ssr in case component is cached and beforeCreate
    // never gets called


    options._ssrRegister = hook;
  } else if (style) {
    hook = shadowMode ? function () {
      style.call(this, createInjectorShadow(this.$root.$options.shadowRoot));
    } : function (context) {
      style.call(this, createInjector(context));
    };
  }

  if (hook) {
    if (options.functional) {
      // register for functional component in vue file
      var originalRender = options.render;

      options.render = function renderWithStyleInjection(h, context) {
        hook.call(context);
        return originalRender(h, context);
      };
    } else {
      // inject component registration as beforeCreate hook
      var existing = options.beforeCreate;
      options.beforeCreate = existing ? [].concat(existing, hook) : [hook];
    }
  }

  return script;
}

var normalizeComponent_1 = normalizeComponent;

var isOldIE = typeof navigator !== 'undefined' && /msie [6-9]\\b/.test(navigator.userAgent.toLowerCase());
function createInjector(context) {
  return function (id, style) {
    return addStyle(id, style);
  };
}
var HEAD = document.head || document.getElementsByTagName('head')[0];
var styles = {};

function addStyle(id, css) {
  var group = isOldIE ? css.media || 'default' : id;
  var style = styles[group] || (styles[group] = {
    ids: new Set(),
    styles: []
  });

  if (!style.ids.has(id)) {
    style.ids.add(id);
    var code = css.source;

    if (css.map) {
      // https://developer.chrome.com/devtools/docs/javascript-debugging
      // this makes source maps inside style tags work properly in Chrome
      code += '\n/*# sourceURL=' + css.map.sources[0] + ' */'; // http://stackoverflow.com/a/26603875

      code += '\n/*# sourceMappingURL=data:application/json;base64,' + btoa(unescape(encodeURIComponent(JSON.stringify(css.map)))) + ' */';
    }

    if (!style.element) {
      style.element = document.createElement('style');
      style.element.type = 'text/css';
      if (css.media) style.element.setAttribute('media', css.media);
      HEAD.appendChild(style.element);
    }

    if ('styleSheet' in style.element) {
      style.styles.push(code);
      style.element.styleSheet.cssText = style.styles.filter(Boolean).join('\n');
    } else {
      var index = style.ids.size - 1;
      var textNode = document.createTextNode(code);
      var nodes = style.element.childNodes;
      if (nodes[index]) style.element.removeChild(nodes[index]);
      if (nodes.length) style.element.insertBefore(textNode, nodes[index]);else style.element.appendChild(textNode);
    }
  }
}

var browser = createInjector;

/* script */
const __vue_script__ = script;

/* template */
var __vue_render__ = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('table',{staticClass:"calendar-table"},[_c('thead',[_c('tr',[_c('th',{staticClass:"prev available v-drp__css-icon-wrapper",on:{"click":function($event){return _vm.$emit('clickPrevMonth')}}},[_c('i',{class:[_vm.arrowLeftClass]})]),_vm._v(" "),_c('th',{staticClass:"month",attrs:{"colspan":"5"}},[_vm._v("\n        "+_vm._s(_vm.monthName)+"\n        "),_vm._v(" "),(_vm.picker.showYearSelect)?_c('select',{directives:[{name:"model",rawName:"v-model",value:(_vm.activeYear),expression:"activeYear"}],staticClass:"yearselect",on:{"change":function($event){var $$selectedVal = Array.prototype.filter.call($event.target.options,function(o){return o.selected}).map(function(o){var val = "_value" in o ? o._value : o.value;return val}); _vm.activeYear=$event.target.multiple ? $$selectedVal : $$selectedVal[0];}}},_vm._l((_vm.RangeOfYear),function(year,index){return _c('option',{key:index,domProps:{"value":year}},[_vm._v(_vm._s(year))])}),0):_c('span',[_vm._v(_vm._s(_vm.activeYear))])]),_vm._v(" "),_c('th',{staticClass:"next available v-drp__css-icon-wrapper",on:{"click":function($event){return _vm.$emit('clickNextMonth')}}},[_c('i',{class:[_vm.arrowRightClass]})])])]),_vm._v(" "),_c('tbody',[_c('tr',_vm._l((_vm.locale.daysOfWeek),function(weekDay,dayIndex){return _c('th',{key:dayIndex},[_vm._v("\n        "+_vm._s(weekDay)+"\n      ")])}),0),_vm._v(" "),_vm._l((_vm.calendar),function(dateRow,rowIndex){return _c('tr',{key:rowIndex},[_vm._l((dateRow),function(date,dateIndex){return _vm._t("date-slot",[_c('td',{key:dateIndex,staticClass:"calendar-cell",class:_vm.dayClass(date),on:{"click":function($event){return _vm.$emit('dateClick', date)},"mouseover":function($event){return _vm.$emit('hoverDate', date)}}},[_c('div',{staticClass:"calendar-cell__content"},[_vm._v("\n            "+_vm._s(_vm._f("dateNum")(date))+"\n          ")])])])})],2)})],2)])};
var __vue_staticRenderFns__ = [];

  /* style */
  const __vue_inject_styles__ = function (inject) {
    if (!inject) return
    inject("data-v-89ba891e_0", { source: "table.calendar-table[data-v-89ba891e]{width:100%;margin:0;border-spacing:0;border-collapse:collapse}table.calendar-table td[data-v-89ba891e],table.calendar-table th[data-v-89ba891e],table.calendar-table tr[data-v-89ba891e]{border:none}table.calendar-table td[data-v-89ba891e],table.calendar-table th[data-v-89ba891e]{white-space:nowrap;text-align:center;vertical-align:middle;min-width:34px;width:34px;padding:17px 0;height:0;line-height:0;font-size:12px;white-space:nowrap;cursor:pointer}table.calendar-table td.calendar-cell[data-v-89ba891e]{position:relative}table.calendar-table td.calendar-cell[data-v-89ba891e]:hover{background-color:#eee;border-color:transparent;color:inherit}table.calendar-table td.calendar-cell.today[data-v-89ba891e]{font-weight:700}table.calendar-table td.calendar-cell.in-range[data-v-89ba891e]{background-color:#eef4ff;border-color:transparent;color:#000;border-radius:0}table.calendar-table td.calendar-cell.active[data-v-89ba891e],table.calendar-table td.calendar-cell.active[data-v-89ba891e]:hover{border-color:transparent;color:#fff}table.calendar-table td.calendar-cell.active.start-date[data-v-89ba891e],table.calendar-table td.calendar-cell.active:hover.start-date[data-v-89ba891e]{border-top-left-radius:34px;border-bottom-left-radius:34px}table.calendar-table td.calendar-cell.active.end-date[data-v-89ba891e],table.calendar-table td.calendar-cell.active:hover.end-date[data-v-89ba891e]{border-top-right-radius:34px;border-bottom-right-radius:34px}table.calendar-table td.calendar-cell.active .calendar-cell__content[data-v-89ba891e],table.calendar-table td.calendar-cell.active:hover .calendar-cell__content[data-v-89ba891e]{position:absolute;top:5%;left:5%;display:flex;align-items:center;justify-content:center;box-sizing:border-box;width:90%;height:90%;line-height:1;border-radius:999px;background-color:#4285f4}table.calendar-table td.calendar-cell.off[data-v-89ba891e],table.calendar-table td.calendar-cell.off.end-date[data-v-89ba891e],table.calendar-table td.calendar-cell.off.in-range[data-v-89ba891e],table.calendar-table td.calendar-cell.off.start-date[data-v-89ba891e]{background-color:#fff;border-color:transparent;color:#999}table.calendar-table td.calendar-cell.off .calendar-cell__content[data-v-89ba891e],table.calendar-table td.calendar-cell.off.end-date .calendar-cell__content[data-v-89ba891e],table.calendar-table td.calendar-cell.off.in-range .calendar-cell__content[data-v-89ba891e],table.calendar-table td.calendar-cell.off.start-date .calendar-cell__content[data-v-89ba891e]{background-color:#fff}.v-drp__css-icon-wrapper[data-v-89ba891e]{position:relative}.v-drp__css-icon-wrapper .v-drp__css-icon.arrow-left[data-v-89ba891e]:before{content:'';position:absolute;left:50%;top:8px;width:7px;height:7px;border-top:solid 2px currentColor;border-right:solid 2px currentColor;transform:rotate(-135deg)}.v-drp__css-icon-wrapper .v-drp__css-icon.arrow-right[data-v-89ba891e]:before{content:'';position:absolute;right:50%;top:8px;width:7px;height:7px;border-top:solid 2px currentColor;border-right:solid 2px currentColor;transform:rotate(45deg)}", map: undefined, media: undefined });

  };
  /* scoped */
  const __vue_scope_id__ = "data-v-89ba891e";
  /* module identifier */
  const __vue_module_identifier__ = undefined;
  /* functional template */
  const __vue_is_functional_template__ = false;
  /* style inject SSR */
  

  
  var Calendar = normalizeComponent_1(
    { render: __vue_render__, staticRenderFns: __vue_staticRenderFns__ },
    __vue_inject_styles__,
    __vue_script__,
    __vue_scope_id__,
    __vue_is_functional_template__,
    __vue_module_identifier__,
    browser,
    undefined
  );

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
var script$1 = {
  props: ['canSelect', 'presets'],
  inject: ['picker'],
  computed: {
    chosenLabel() {
      let chosenLabel = '';
      let customRange = true;
      const picker = this.picker;
      const ftm = 'YYYY-MM-DD';

      for (const preset of this.presets) {
        const [start, end] = preset.range; // ignore times when comparing dates if time picker is not enabled

        if (picker.start_.format(ftm) === start.format(ftm) && picker.end_.format(ftm) === end.format(ftm)) {
          customRange = false;
          chosenLabel = preset.label;
          break;
        }
      }

      if (customRange) {
        if (this.picker.showCustomRangeLabel) {
          chosenLabel = this.picker.locale.customRangeLabel;
        } else {
          chosenLabel = null;
        }
      }

      return chosenLabel;
    },

    presets_() {
      if (this.picker.showCustomRangeLabel) {
        return [...this.presets, {
          label: this.picker.locale.customRangeLabel,
          range: ''
        }];
      }

      return this.presets;
    }

  }
};

/* script */
const __vue_script__$1 = script$1;

/* template */
var __vue_render__$1 = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"ranges"},[_c('ul',_vm._l((_vm.presets_),function(item,index){return _c('li',{key:index,class:{'active': item.label === _vm.chosenLabel},on:{"click":function($event){return _vm.$emit('clickPreset',item)}}},[_vm._v("\n      "+_vm._s(item.label)+"\n    ")])}),0),_vm._v(" "),(!_vm.picker.autoApply)?_c('div',{staticClass:"action-buttons"},[_c('button',{staticClass:"btn btn-sm btn-success",attrs:{"disabled":_vm.canSelect,"type":"button"},on:{"click":function($event){return _vm.$emit('clickApply')}}},[_vm._v("\n      Apply\n    ")]),_vm._v(" "),_c('button',{staticClass:"btn btn-sm btn-default",attrs:{"type":"button"},on:{"click":function($event){return _vm.$emit('clickCancel')}}},[_vm._v("\n      Cancel\n    ")])]):_vm._e()])};
var __vue_staticRenderFns__$1 = [];

  /* style */
  const __vue_inject_styles__$1 = function (inject) {
    if (!inject) return
    inject("data-v-4e185066_0", { source: ".action-buttons[data-v-4e185066]{clear:both;padding:8px;line-height:12px;vertical-align:middle}.ranges[data-v-4e185066]{font-size:12px;float:none;margin-top:8px;text-align:left}.ranges ul[data-v-4e185066]{list-style:none;margin:0 auto;padding:0;width:100%}.ranges li[data-v-4e185066]{box-sizing:border-box;font-size:12px;padding:8px 12px;cursor:pointer}.ranges li[data-v-4e185066]:hover{background-color:#eee}.ranges li.active[data-v-4e185066]{color:#4285f4}@media (min-width:564px){.ranges ul[data-v-4e185066]{width:140px}}", map: undefined, media: undefined });

  };
  /* scoped */
  const __vue_scope_id__$1 = "data-v-4e185066";
  /* module identifier */
  const __vue_module_identifier__$1 = undefined;
  /* functional template */
  const __vue_is_functional_template__$1 = false;
  /* style inject SSR */
  

  
  var CalendarRanges = normalizeComponent_1(
    { render: __vue_render__$1, staticRenderFns: __vue_staticRenderFns__$1 },
    __vue_inject_styles__$1,
    __vue_script__$1,
    __vue_scope_id__$1,
    __vue_is_functional_template__$1,
    __vue_module_identifier__$1,
    browser,
    undefined
  );

//
//
//
//
//
//
//
//
var script$2 = {
  inheritAttrs: false,
  inject: ['picker'],
  props: ['value'],
  computed: {
    inputClass() {
      return {
        'text-field__filled': this.value.trim().length > 0
      };
    }

  }
};

/* script */
const __vue_script__$2 = script$2;

/* template */
var __vue_render__$2 = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"activator-wrapper"},[_c('input',_vm._b({staticClass:"text-field",class:_vm.inputClass,attrs:{"type":"text"},domProps:{"value":_vm.value}},'input',_vm.$attrs,false)),_vm._v(" "),(_vm.picker.showActivatorBar)?_c('span',{staticClass:"bar"}):_vm._e(),_vm._v(" "),(_vm.picker.showActivatorLabel)?_c('label',[_vm._v("Select Date")]):_vm._e()])};
var __vue_staticRenderFns__$2 = [];

  /* style */
  const __vue_inject_styles__$2 = function (inject) {
    if (!inject) return
    inject("data-v-69b5ef5b_0", { source: ".mdrp__activator{width:100%;display:inline-block}.mdrp__activator .activator-wrapper{position:relative}.mdrp__activator .activator-wrapper .text-field{display:block;font-size:16px;padding:4px 10px 10px 5px;width:300px;border:none;border-bottom:1px solid #e8e8e8;color:#35495e}.mdrp__activator .activator-wrapper .text-field:focus{outline:0}.mdrp__activator .activator-wrapper label{color:#999;font-size:14px;font-weight:400;position:absolute;pointer-events:none;left:5px;top:10px;transition:.2s ease all}.mdrp__activator .activator-wrapper .text-field:focus~label,.mdrp__activator .activator-wrapper .text-field__filled~label{top:-20px;font-size:14px;color:#4285f4}.mdrp__activator .activator-wrapper .bar{position:relative;display:block;width:315px}.mdrp__activator .activator-wrapper .bar:after,.mdrp__activator .activator-wrapper .bar:before{content:'';height:2px;width:0;bottom:1px;position:absolute;background:#4285f4;transition:.2s ease all}.mdrp__activator .activator-wrapper .bar:before{left:50%}.mdrp__activator .activator-wrapper .bar:after{right:50%}.mdrp__activator .activator-wrapper .text-field:focus~.bar:after,.mdrp__activator .activator-wrapper .text-field:focus~.bar:before{width:50%}", map: undefined, media: undefined });

  };
  /* scoped */
  const __vue_scope_id__$2 = undefined;
  /* module identifier */
  const __vue_module_identifier__$2 = undefined;
  /* functional template */
  const __vue_is_functional_template__$2 = false;
  /* style inject SSR */
  

  
  var DefaultActivator = normalizeComponent_1(
    { render: __vue_render__$2, staticRenderFns: __vue_staticRenderFns__$2 },
    __vue_inject_styles__$2,
    __vue_script__$2,
    __vue_scope_id__$2,
    __vue_is_functional_template__$2,
    __vue_module_identifier__$2,
    browser,
    undefined
  );

var clickoutside = {
  bind(el, binding, vnode) {
    function documentHandler(e) {
      if (el.contains(e.target)) {
        return false;
      }

      if (binding.expression) {
        binding.value(e);
      }
    }

    el.__vueClickOutside__ = documentHandler;
    document.addEventListener('click', documentHandler, true);
  },

  update() {},

  unbind(el, binding) {
    document.removeEventListener('click', el.__vueClickOutside__, true);
    delete el.__vueClickOutside__;
  }

};

/**
 * 生成时间快捷范围
 * @param { Number } startOffset start date 偏移
 * @param { Number } endOffset end date 偏移
 * @param { Number } period 时间维度：day or month
 */

function getRange(startOffset = 0, endOffset = 0, period = 'day') {
  return [moment().subtract(startOffset, period).startOf(period), moment().subtract(endOffset, period).endOf(period)];
}

const defaultPresets = [{
  label: 'Today',
  range: getRange(0, 0)
}, {
  label: 'Yesterday',
  range: getRange(1, 1)
}, {
  label: 'Last 7 Days',
  range: getRange(6, 0)
}, {
  label: 'Last 30 Days',
  range: getRange(29, 0)
}, {
  label: 'This Month',
  range: getRange(0, 0, 'month')
}, {
  label: 'Last Month',
  range: getRange(1, 1, 'month')
}];

//
var script$3 = {
  name: 'v-md-date-range-picker',
  components: {
    Calendar,
    CalendarRanges,
    DefaultActivator
  },
  directives: {
    clickoutside
  },

  provide() {
    return {
      'picker': this
    };
  },

  props: {
    // The beginning date of the initially selected date range.
    // If you provide a string, it must match the date format string set in your locale setting
    startDate: {
      type: String,
      default: moment().format('YYYY-MM-DD')
    },
    // The end date of the initially selected date range.
    endDate: {
      type: String,
      default: moment().format('YYYY-MM-DD')
    },
    // Set predefined date ranges the user can select from.
    // The range of each object an array with two dates representing the bounds of the range.
    presets: {
      type: Array,

      default() {
        return defaultPresets;
      }

    },
    // Whether the picker appears aligned to the left, to the right, or centered under the HTML element it's attached to.
    opens: {
      type: String,
      default: 'left'
    },
    // Displays "Custom Range" at the end of the list of predefined ranges, when the ranges option is used.
    // This option will be highlighted whenever the current date range selection does not match one of the predefined ranges.
    // Clicking it will display the calendars to select a new range.
    showCustomRangeLabel: {
      type: Boolean,
      default: false
    },
    // Show year select boxes above calendars to jump to a specific year.
    showYearSelect: {
      type: Boolean,
      default: false
    },
    // The minimum year shown in the dropdowns when showYearSelect is set to true.
    minYear: {
      type: String,
      default: moment().subtract(100, 'year').format('YYYY')
    },
    // The maximum year shown in the dropdowns when showYearSelect is set to true.
    maxYear: {
      type: String,
      default: moment().add(100, 'year').format('YYYY')
    },
    // Hide the apply and cancel buttons, and automatically apply a new date range as soon as two dates are clicked.
    autoApply: {
      type: Boolean,
      default: true
    },
    // show label for the default activator (inputbox)
    showActivatorLabel: {
      type: Boolean,
      default: true
    },
    // show animation bar for the default activator (inputbox)
    showActivatorBar: {
      type: Boolean,
      default: true
    },
    showPresets: {
      type: Boolean,
      default: true
    }
  },

  data() {
    const data = {
      locale: {
        direction: 'ltr',
        format: 'YYYY-MM-DD',
        separator: ' - ',
        applyLabel: 'Apply',
        cancelLabel: 'Cancel',
        weekLabel: 'W',
        customRangeLabel: 'Custom Range',
        daysOfWeek: moment.weekdaysMin(),
        monthNames: moment.monthsShort(),
        firstDay: moment.localeData().firstDayOfWeek()
      }
    }; // TODO 这里的 props 究竟是放在 data 里面进行初始化好，还是放在生命周期中好呢？
    // https://github.com/ly525/blog/issues/252
    // https://github.com/ly525/blog/issues/258

    data.leftCalendarMonth_ = moment(this.startDate);
    data.rightCalendarMonth_ = moment(this.endDate);
    data.start_ = moment(this.startDate);
    data.end_ = moment(this.endDate);
    data.hoverStart_ = moment(this.startDate);
    data.hoverEnd_ = moment(this.endDate); // fix #14

    data.cloneStart = moment(this.startDate);
    data.cloneEnd = moment(this.endDate);
    data.startText = moment(this.startDate).format(data.locale.format);
    data.endText = moment(this.endDate).format(data.locale.format);
    data.inRange = false; // inRange means whether user click once, if user click once, set value true

    data.pickerVisible = false; // update day names order to firstDay

    if (data.locale.firstDay !== 0) {
      let iterator = data.locale.firstDay;

      while (iterator > 0) {
        data.locale.daysOfWeek.push(data.locale.daysOfWeek.shift());
        iterator--;
      }
    }

    return data;
  },

  methods: {
    clickYearSelect({
      location,
      calendarMonth
    }) {
      this[`${location}CalendarMonth_`] = calendarMonth.clone();
    },

    clickNextMonth() {
      // TODO 如果有 linkedCalendars，需要更新代码
      // moment.js 的 add 和 sub tract 的改变自身的行为没有被 watch 到，原因是什么呢？
      this.leftCalendarMonth_ = this.leftCalendarMonth_.clone().add(1, 'month');
    },

    clickPrevMonth() {
      // TODO 如果有 linkedCalendars，需要更新代码
      this.leftCalendarMonth_ = this.leftCalendarMonth_.clone().subtract(1, 'month');
    },

    /**
     * TODO type of value
     */
    dateClick(value) {
      if (this.inRange) {
        // second click
        // second click action(第二次点击)
        this.inRange = false; // if second click value is smaller than first, which means user clicked a previous date,
        // so set the smaller date as start date, bigger one as end date

        if (value.isBefore(this.start_)) {
          this.end_ = this.start_;
          this.start_ = value.clone();
        } else {
          this.end_ = value.clone();
        } // feature #49


        if (this.autoApply) {
          this.clickApply();
        }
      } else {
        // first click
        // first click action, set value as start and end(第一次点击, 设置起始值皆为点击的值)
        this.inRange = true;
        this.start_ = value.clone();
        this.end_ = value.clone(); // Notice: If you watch start_, its callback function will be executed after end_ is assigned, which is exactly what we want.
        // You can add a loop to test here
        // In fact, the callback function is actually updateMonthCalendar, which is to update the date based on the values of start and end.
        // So if the callback is callback after both the start_ and end_, that's right!
        // updateMonthCalendar() === callback function for watch start_
      }
    },

    hoverDate(value) {
      if (this.inRange) {
        if (value > this.start_) {
          // 参见：https://github.com/ly525/blog/issues/254
          this.hoverStart_ = this.start_.clone();
          this.hoverEnd_ = value.clone();
        } else {
          this.hoverEnd_ = this.start_.clone();
          this.hoverStart_ = value.clone();
        }
      }
    },

    togglePicker() {
      // ---- fix #53 start ----
      let elm = this.$refs.defaultActivator && this.$refs.defaultActivator.$el; // fix #55: this.$slots.input[0] -> this.$slots.input[0].elm

      const slotActivator = this.$slots.input && this.$slots.input.length && this.$slots.input[0].elm;

      if (!elm && (slotActivator.querySelector('input') || slotActivator.querySelector('button'))) {
        elm = slotActivator;
      }

      if (elm) {
        // 1. dont return or do nothing here,
        // because you need to show the picker panel if the picker panel is hidden(example: user click the activator first time)
        // but `this.pickerVisible = !this.pickerVisible;` do the samething in this case.
        // So why set pickerVisible always `true` if elm exist?
        // 2. [interact]: because if the type of activator is input or button and the picker panel is already visible (pickerVisible === true),
        // when the user click the activator, the picker panel should keep visible(can not fold the picker panel)
        // Chinese：
        // 1. 不能在这里 return 或 啥都不做
        // 因为如果日期选择器是隐藏的，点击了 input 需要显示日期选择器。比如用户第一次点击日期选择器的时候
        // 但是在这种情况下做，下面的 `this.pickerVisible = !this.pickerVisible;` 做了一样的事
        // 那么为何需要在 elm 为 true 的时候，总是设置 pickerVisible 为 true 呢？
        // 2. [交互] 我们约定，当 activator 的类型是 input 或 button，以及 选择器面板已经 打开的情况下，
        // 当用户点击了 activator 的时候，不收起日期选择器面板
        this.pickerVisible = true;
      } else {
        this.pickerVisible = !this.pickerVisible;
      } // ---- fix #53 end ----

    },

    pickerStyles() {
      return {
        'show-calendar': this.pickerVisible,
        'opens-arrow-pos-right': this.opens === 'right',
        'opens-arrow-pos-left': this.opens === 'left',
        'opens-arrow-pos-center': this.opens === 'center'
      };
    },

    clickApply() {
      this.pickerVisible = false; // fix #14
      // if the use only click the picker only one time,
      // then close the picker directly(by clickoutside or click the activator)

      if (this.inRange) {
        this.inRange = false;
        this.start_ = this.cloneStart.clone();
        this.end_ = this.cloneEnd.clone();
        return;
      }

      this.updateTextField();
      this.cloneForCancelUsage();
      this.emitChange();
    },

    clickPreset(preset) {
      if (preset.label === this.locale.customRangeLabel) return;
      const [start, end] = preset.range;
      this.start_ = moment(start);
      this.end_ = moment(end); // fix #47

      this.leftCalendarMonth_ = moment(start); // TODO 需要想一下，联动情况下，快捷日期，选择范围如果超过两个月，该如何显示？
      // TODO if linkedCalendar, what should the UI show if end - start > 60 days?
      // feature #49

      if (this.autoApply) {
        this.clickApply();
      }
    },

    /**
     *
    */
    updateTextField() {
      // do not update the input slot provided content by the parent
      if (this.$slots.input) return;
      this.startText = this.start_.format(this.locale.format);
      this.endText = this.end_.format(this.locale.format);
    },

    /**
     * fix #14
     * clone start and end for the following scenes, mainly for reseting the selected date to origin state:
     * 1. (autoApply: false) click start [or both start and end], but click the cancel button
     * 2. (autoApply: true) just click one time, and then click outside
     *
     * TODO (need discussion) maybe we can do this action in watch pickerVisible (from hidden to visible)
     * DONE we also need to do clone start and end in the watcher of ther related prop
     *
     */
    cloneForCancelUsage() {
      this.cloneStart = this.start_.clone();
      this.cloneEnd = this.end_.clone();
    },

    emitChange() {
      const start = this.start_.clone();
      const end = this.end_.clone();
      this.$emit('change', [start, end], [start.format('YYYY-MM-DD'), end.format('YYYY-MM-DD')]); // TODO if developer do not set the event listener for @change or @input, we may need change the startText and endText in the component,
      // TODO support v-model
    },

    clickOutside() {
      if (!this.pickerVisible) return;
      this.clickApply();
    }

  },
  watch: {
    /**
     * 有两个地方：
     * 1. 点击左侧快捷键(clickPreset)，确认 start_
     * 2.
     *
     * 如果使用 计算属性，则 clickPrevMonth 和 clickNextMonth 的时候，需要设置计算属性的 setter，但这时候 setter 就不知道写什么了
     * TODO 值变化的时候，什么时候执行 watch 呢？ nextTick 吗？
     */
    start_(value) {
      this.hoverStart_ = value.clone(); // inspired by https://github.com/dangrossman/daterangepicker/blob/master/daterangepicker.js#L554
      // fix #43

      if (value.month() === this.end_.month()) return;
      this.leftCalendarMonth_ = value.clone();
    },

    end_(value) {
      this.hoverEnd_ = value.clone();
    },

    leftCalendarMonth_: {
      handler(leftMonth) {
        this.rightCalendarMonth_ = leftMonth.clone().add(1, 'month');
      },

      immediate: true
    },

    startDate(value) {
      this.start_ = moment(value);
      this.startText = moment(value).format(this.locale.format);
      this.cloneStart = moment(value); // fix #14
    },

    endDate(value) {
      this.end_ = moment(value);
      this.endText = moment(value).format(this.locale.format);
      this.cloneEnd = moment(value); // fix #14
      // TODO not linked calendar
    }

  }
};

/* script */
const __vue_script__$3 = script$3;

/* template */
var __vue_render__$3 = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{directives:[{name:"clickoutside",rawName:"v-clickoutside",value:(_vm.clickOutside),expression:"clickOutside"}],staticClass:"mdrp-root"},[_c('div',{staticClass:"mdrp__activator",on:{"click":_vm.togglePicker}},[_vm._t("input",[_c('default-activator',{ref:"defaultActivator",attrs:{"value":(_vm.startText + " - " + _vm.endText),"readonly":""}})])],2),_vm._v(" "),_c('transition',{attrs:{"name":"slide-fade","mode":"out-in"}},[_c('div',{directives:[{name:"show",rawName:"v-show",value:(_vm.pickerVisible),expression:"pickerVisible"}],staticClass:"mdrp__panel dropdown-menu",class:_vm.pickerStyles()},[(_vm.showPresets && _vm.presets)?_c('calendar-ranges',{attrs:{"canSelect":_vm.inRange,"presets":_vm.presets},on:{"clickCancel":function($event){_vm.pickerVisible = false;},"clickApply":_vm.clickApply,"clickPreset":_vm.clickPreset}}):_vm._e(),_vm._v(" "),_c('calendar',{staticClass:"calendar left",attrs:{"location":"left","calendar-month":_vm.leftCalendarMonth_,"locale":_vm.locale,"start":_vm.start_,"end":_vm.end_,"hover-start":_vm.hoverStart_,"hover-end":_vm.hoverEnd_},on:{"clickNextMonth":_vm.clickNextMonth,"clickPrevMonth":_vm.clickPrevMonth,"dateClick":_vm.dateClick,"hoverDate":_vm.hoverDate,"clickYearSelect":_vm.clickYearSelect}}),_vm._v(" "),_c('calendar',{staticClass:"calendar right",attrs:{"location":"right","calendar-month":_vm.rightCalendarMonth_,"locale":_vm.locale,"start":_vm.start_,"end":_vm.end_,"hover-start":_vm.hoverStart_,"hover-end":_vm.hoverEnd_},on:{"clickNextMonth":_vm.clickNextMonth,"clickPrevMonth":_vm.clickPrevMonth,"dateClick":_vm.dateClick,"hoverDate":_vm.hoverDate,"clickYearSelect":_vm.clickYearSelect}})],1)])],1)};
var __vue_staticRenderFns__$3 = [];

  /* style */
  const __vue_inject_styles__$3 = function (inject) {
    if (!inject) return
    inject("data-v-805bab72_0", { source: "@charset \"UTF-8\";*[data-v-805bab72]{box-sizing:border-box}.mdrp__panel.opens-arrow-pos-center[data-v-805bab72]::after,.mdrp__panel.opens-arrow-pos-center[data-v-805bab72]::before{left:0;right:0;width:0;margin-left:auto;margin-right:auto}.mdrp-root[data-v-805bab72]{position:relative;display:inline-block}.mdrp__panel[data-v-805bab72]{font-size:15px;line-height:1em;position:absolute;z-index:3001;top:100px;left:20px;width:278px;max-width:none;margin-top:7px;padding:0;color:inherit;border:1px solid #ddd;border-radius:4px;background-color:#fff}.mdrp__panel.show-calendar[data-v-805bab72]{display:block}.mdrp__panel[data-v-805bab72]::after,.mdrp__panel[data-v-805bab72]::before{position:absolute;display:inline-block;border-bottom-color:red;content:\"\"}.mdrp__panel[data-v-805bab72]::before{top:-7px;border-right:7px solid transparent;border-bottom:7px solid #ccc;border-left:7px solid transparent}.mdrp__panel[data-v-805bab72]::after{top:-6px;border-right:6px solid transparent;border-bottom:6px solid #fff;border-left:6px solid transparent}.mdrp__panel.opens-arrow-pos-left[data-v-805bab72]{top:40px;left:10px;right:auto}.mdrp__panel.opens-arrow-pos-left[data-v-805bab72]::before{left:9px}.mdrp__panel.opens-arrow-pos-left[data-v-805bab72]::after{left:10px}.mdrp__panel.opens-arrow-pos-right[data-v-805bab72]{top:40px;right:10px;left:auto}.mdrp__panel.opens-arrow-pos-right[data-v-805bab72]::before{right:9px}.mdrp__panel.opens-arrow-pos-right[data-v-805bab72]::after{right:10px}.mdrp__panel.opens-arrow-pos-center[data-v-805bab72]{top:40px}.mdrp__panel.dropdown-menu[data-v-805bab72]{max-width:none;z-index:9}.mdrp__panel .calendar-table[data-v-805bab72]{display:none;max-width:270px}.mdrp__panel.show-calendar .calendar-table[data-v-805bab72]{display:block}@media (min-width:564px){.mdrp__panel[data-v-805bab72]{width:auto}.mdrp__panel.show-calendar[data-v-805bab72]{display:inline-flex}.mdrp__panel .calendar-table.left[data-v-805bab72]{padding:8px 0 8px 8px}.mdrp__panel .calendar-table.right[data-v-805bab72]{padding:8px}}.slide-fade-enter-active[data-v-805bab72]{transition:all .2s ease}.slide-fade-leave-active[data-v-805bab72]{transition:all .1s cubic-bezier(1,.5,.8,1)}.slide-fade-enter[data-v-805bab72],.slide-fade-leave-to[data-v-805bab72]{transform:translateX(10px);opacity:0}", map: undefined, media: undefined });

  };
  /* scoped */
  const __vue_scope_id__$3 = "data-v-805bab72";
  /* module identifier */
  const __vue_module_identifier__$3 = undefined;
  /* functional template */
  const __vue_is_functional_template__$3 = false;
  /* style inject SSR */
  

  
  var VMdDateRangePicker = normalizeComponent_1(
    { render: __vue_render__$3, staticRenderFns: __vue_staticRenderFns__$3 },
    __vue_inject_styles__$3,
    __vue_script__$3,
    __vue_scope_id__$3,
    __vue_is_functional_template__$3,
    __vue_module_identifier__$3,
    browser,
    undefined
  );

// import "./styles/index.scss";

const install = function (Vue) {
  Vue.component(VMdDateRangePicker.name, VMdDateRangePicker);
}; // auto install


if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue);
}

var index = {
  install,
  VMdDateRangePicker
};

export default index;
