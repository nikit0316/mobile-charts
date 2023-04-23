import { Component } from 'react';
import Model from '../model/Model';

export default class ModelComponent extends Component {
    modelName = null
    model = null
    shimmer = true

    constructor(p) {
        super(p);
        this.state = p || {};
        this.model = Model.get(this.props.modelName) || this.createModel();
        this.onModelUpdate = this.onModelUpdate.bind(this);
    }

    getShimmer() {
        if (this.shimmer) {
            return <div className="shimmer" />;
        }
    }

    componentDidMount() {
        this.model.listen(this.onModelUpdate);
    }

    componentWillUnmount() {
        this.model.unlisten(this.onModelUpdate);
    }

    createModel() {
        return Model.get(this.getModelName());
    }

    onModelUpdate(d) {
        var st = {},
            k = 'model_key_' + this.getModelName();

        this.shimmer = false;
        st[k] = (this.state[k] || 0) + 1;
        if (!this.props.onModelUpdate || (this.props.onModelUpdate() !== false)) {
            this.setState(st);
        }
    }

    getModelName() {
        return this.props.modelName || this.modelName || (this.model && this.model.getName());
    }
}
