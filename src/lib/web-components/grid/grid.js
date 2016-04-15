'use strict';

var
  template = require('raw!./grid.html'),
  tableTemplate = require('raw!./grid-table.html'),
  defaultRowsPerPage = [
    {label: '5', value: 5},
    {label: '10', value: 10},
    {label: '15', value: 15},
    {label: '25', value: 25},
    {label: '50', value: 50},
    {label: '100', value: 100},
    {label: 'No pagination', value: 0}
  ];

function getRowsPerPageOption(rowsPerPage) {
  if (defaultRowsPerPage.find(function(column) { return column.value === rowsPerPage; })) {
    return defaultRowsPerPage;
  }

  var options = defaultRowsPerPage.slice(0);

  options.unshift({
    label: '' + rowsPerPage,
    value: rowsPerPage
  });

  return options;
}

function getColumnsFieldArray(columns) {
  return columns.map(function(column) {
    return column.field;
  });
}

Vue.component('grid', {
  template: template,
  props: {
    columns: {
      type: Array,
      required: true
    },
    data: {
      type: Array,
      required: true
    },
    rowsPerPage: {
      type: Number,
      default: 5
    },
    sortable: {
      type: Boolean,
      default: true,
      coerce: function(value) {
        return value ? true : false;
      }
    }
  },
  data: function() {
    return {
      searchQuery: ''
    };
  },
  computed: {
    formattedData: function() {
      var columns = this.columns.filter(function(column) {
        return column.formatter;
      });

      if (columns.length === 0) {
        return this.data;
      }

      return this.data.map(function(item) {
        columns.forEach(function(column) {
          item[column.field] = column.formatter(item[column.field]);
        });

        return item;
      });
    }
  }
});

Vue.component('grid-table', {
  template: tableTemplate,
  props: ['data', 'columns', 'rowsPerPage', 'sortable'],
  data: function() {
    var rowsPerPage = this.rowsPerPage;
    var chosenColumns = this.getChosenColumn();

    return {
      page: 1,
      rowsPerPageOptions: getRowsPerPageOption(rowsPerPage),
      sortField: '',
      sortOrder: 1,
      chosenColumnsModel: chosenColumns
    };
  },
  computed: {
    rowsNumber: function() {
      return this.data.length;
    },
    pagesNumber: function() {
      return Math.ceil(this.data.length / this.rowsPerPage);
    },
    chosenColumnsOptions: function() {
      return this.columns.map(function(column) {
        return {
          label: column.label,
          value: column.field
        };
      });
    }
  },
  watch: {
    data: function() {
      this.page = 1;
    },
    rowsPerPage: function(value) {
      this.page = 1;
    },
    chosenColumnsModel: function(options) {
      for (var i = 0; i < this.columns.length; i++) {
        this.columns.$set(i, $.extend({}, this.columns[i], {
          hidden: !options.includes(this.columns[i].field)
        }));
      }
    }
  },
  methods: {
    goToPageByOffset: function(pageOffset) {
      this.page = Math.min(this.pagesNumber, Math.max(1, this.page + pageOffset));
    },
    sortBy: function(field) {
      // if sort field got changed
      if (this.sortField !== field) {
        this.sortOrder = 1;
        this.sortField = field;
        return;
      }

      // else we sort on same field
      if (this.sortOrder === -1) {
        this.sortField = '';
      }
      else {
        this.sortOrder = -1;
      }
    },
    getChosenColumn: function() {
      return this.columns.filter(function(column) {
        return column.hidden !== true;
      }).map(function(column) {
        return column.field;
      });
    }
  }
});