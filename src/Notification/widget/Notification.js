import { defineWidget } from '@/helpers/widget';
import { log, runCallback } from '@/helpers';

import domConstruct from 'dojo/dom-construct';
import domClass from 'dojo/dom-class';
import domAttr from 'dojo/dom-attr';
import html from 'dojo/html';
import dojoArray from 'dojo/_base/array';

import storage from 'local-storage-fallback';
import md5 from 'md5';
import Showdown from 'showdown';

const types = ['success', 'info', 'warning', 'danger'];
const converter = new Showdown.Converter();

import './Notification.scss';

export default defineWidget('Notification', false, {

    // Set in the modeler
    attrText: '',
    attrType: '',
    typeEnum: 'info',
    typeText: 'html',
    storageKey: '',

    // Internal properties
    _text: '',
    _value: '',

    _obj: null,
    _alert: null,
    _closeButton: null,
    _textNode: null,
    _storageKey: '',

    postCreate() {
        log.call(this, 'postCreate', this._WIDGET_VERSION);
        domAttr.set(this.domNode, 'data-widget-version', this._WIDGET_VERSION);
        this.createAlert();
        this._storageKey = `_closable_notification_${this.storageKey}`;
    },

    update(obj, cb) {
        log.call(this, 'update');

        this._obj = obj;

        if (obj && this.attrText) {
            this.updateRendering(cb);
        } else {
            runCallback.call(this, cb, 'update');
        }
    },

    updateRendering(cb) {
        this.resetSubscriptions();
        try {
            this._obj.fetch(this.attrText, val => {
                this._text = val;
                if (val && '' !== val) {
                    let alertHTML;
                    if ('html' === this.typeText) {
                        alertHTML = this._text.replace(/\n/gi, '<br />');
                    } else {
                        alertHTML = converter.makeHtml(this._text);
                    }

                    html.set(this._textNode, alertHTML);
                    this._value = md5(val);

                    if (this._isKeyDefined()) {
                        domClass.add(this.domNode, 'hidden');
                    } else {
                        this.setTypeAndShow();
                    }
                } else {
                    domClass.add(this.domNode, 'hidden');
                }
                runCallback.call(this, cb, 'update');
            });
        } catch (e) {
            logger.warn(this.id, e);
            domClass.add(this.domNode, 'hidden');
            runCallback.call(this, cb, 'update');
        }
    },

    setTypeAndShow() {
        if ('' !== this.attrType) {
            this._obj.fetch(this.attrType, val => {
                let isSet = false;
                dojoArray.forEach(types, type => {
                    if (type === val){
                        isSet = true;
                    }
                    domClass.toggle(this._alert, `alert-${type}`, type === val);
                });
                if (!isSet) {
                    domClass.toggle(this._alert, `alert-info`, true);
                }
                domClass.remove(this.domNode, 'hidden');
            });
        } else {
            dojoArray.forEach(types, type => {
                domClass.toggle(this._alert, `alert-${type}`, type === this.typeEnum);
            });
            domClass.remove(this.domNode, 'hidden');
        }
    },

    createAlert() {
        domClass.add(this.domNode, 'hidden');
        domClass.add(this.domNode, 'alert_widget_dismissable');

        this._alert = domConstruct.create('div', {
            role: 'alert',
            className: 'alert alert-dismissible',
        }, this.domNode);

        this._textNode = domConstruct.create('div', {
            innerHTML: 'This is an alert',
        }, this._alert, 'last');

        this._closeButton = domConstruct.create('button', {
            type: 'button',
            className: 'close',
            innerHTML: '<span aria-hidden="true">&times;</span>',
            'aria-label': 'Close',
            'data-dismiss': 'alert',
        }, this._alert, 'first');

        this.connect(this._closeButton, 'click', this._close.bind(this));
    },

    resetSubscriptions() {
        this.unsubscribeAll();
        if (this._obj) {
            this.subscribe({
                guid: this._obj.getGuid(),
                callback: guid => {
                    mx.data.get({
                        guid,
                        callback: obj => {
                            this._obj = obj;
                            if (obj) {
                                this.updateRendering();
                            }
                        },
                    });
                },
            });
        }
    },

    _isKeyDefined() {
        const item = storage.getItem(this._storageKey);
        return item === this._value;
    },

    _close() {
        storage.setItem(this._storageKey, this._value);
        domClass.add(this.domNode, 'hidden');
    },
});
