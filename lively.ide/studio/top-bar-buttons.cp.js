import { component, ViewModel, Icon, part, TilingLayout, ShadowObject, Label } from 'lively.morphic';
import { Color, pt, rect } from 'lively.graphics';

class TopBarButtonModel extends ViewModel {
  static get properties () {
    return {
      expose: {
        get () {
          return ['activateButton', 'deactivateButton'];
        }
      },
      opts: {}
    };
  }

  activateButton () {
    this.view.master = TopBarButtonSelected;
  }

  deactivateButton () {
    this.view.master = null;
  }
}

export const TopBarButton = component({
  type: Label,
  defaultViewModel: TopBarButtonModel,
  name: 'top bar button',
  lineHeight: 1,
  fontColor: {
    value: Color.rgb(102, 102, 102),
    onlyAtInstantiation: true
  },
  fontSize: {
    value: 23,
    onlyAtInstantiation: true
  },
  nativeCursor: 'pointer',
  padding: {
    value: rect(0, 1, 0, -1),
    onlyAtInstantiation: true
  }
});

export const TopBarButtonSelected = component(TopBarButton, {
  name: 'top bar button selected',
  dropShadow: new ShadowObject({ color: Color.rgba(64, 196, 255, 0.4), fast: false }),
  fontColor: Color.rgb(0, 176, 255)
});

class TopBarButtonDropDownModel extends ViewModel {
  static get properties () {
    return {
      expose: {
        get () {
          return ['dropdown', 'symbol', 'activateButton', 'deactivateButton'];
        }
      },
      opts: {}
    };
  }

  activateButton () {
    this.symbol.master = TopBarButtonSelected; // eslint-disable-line no-use-before-define
  }

  deactivateButton () {
    this.symbol.master = null;
  }

  get dropdown () {
    return this.view.get(this.opts.dropdown.name);
  }

  get symbol () {
    return this.view.get(this.opts.symbol.name);
  }

  viewDidLoad () {
    const { view, opts } = this;
    view.name = opts.name;
    view.tooltip = opts.tooltip;
    const symbolButton = view.get('symbol');
    const dropdownButton = view.get('dropdown');
    symbolButton.name = opts.symbol.name;
    symbolButton.tooltip = opts.symbol.tooltip;
    symbolButton.textAndAttributes = opts.symbol.textAndAttributes;
    dropdownButton.name = opts.dropdown.name;

    delete this.view.owner.owner.viewModel._ui;
  }
}

export const TopBarButtonDropDown = component({
  name: 'outer button name',
  defaultViewModel: TopBarButtonDropDownModel,
  extent: pt(55.8, 24.7),
  fill: Color.rgba(46, 75, 223, 0),
  layout: new TilingLayout({
    axisAlign: 'center',
    align: 'center',
    padding: {
      height: 0,
      width: 0,
      x: 5,
      y: 5
    },
    spacing: 5
  }),
  nativeCursor: 'pointer',
  submorphs: [
    part(TopBarButton, {
      name: 'symbol',
      reactsToPointer: false,
      textAndAttributes: Icon.textAttribute('square'),
      tooltip: 'symbol tooltip'
    }),
    part(TopBarButton, {
      name: 'dropdown',
      fontSize: 23,
      nativeCursor: 'pointer',
      textAndAttributes: Icon.textAttribute('angle-down')
    })
  ],
  tooltip: 'dropdown tooltip'
});