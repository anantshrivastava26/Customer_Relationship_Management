# ML Models in This Project

This document lists all machine-learning model logic used by the Retail CRM project.

## 1. Primary Trained Model (Production)

- Name: Customer Value Classifier
- Type: Scikit-learn pipeline
- Pipeline steps:
  - StandardScaler
  - LogisticRegression(max_iter=500, class_weight="balanced", random_state=42)
- Training code: [backend/ml/train.py](../backend/ml/train.py#L58)
- Classifier definition: [backend/ml/train.py](../backend/ml/train.py#L61)

### Why This Model Was Chosen

- It is intentionally selected in training code as the classifier, and there is currently no automatic model-selection loop: [backend/ml/train.py](../backend/ml/train.py#L61)
- The task is binary classification on engineered tabular customer features (`high_value` vs `regular`): [backend/ml/train.py](../backend/ml/train.py#L33)
- The API needs probability outputs, and this model provides `predict_proba`, which is used at inference time: [backend/app/model_service.py](../backend/app/model_service.py#L30)
- `class_weight="balanced"` is enabled to better handle class imbalance during training: [backend/ml/train.py](../backend/ml/train.py#L61)
- It is lightweight and practical for quick retraining and fast API inference while still giving strong baseline metrics in tracked runs (for example ROC AUC): [backend/ml/mlruns/820610611326476076/83723a7949674238bc1306e997ba5544/metrics/roc_auc](../backend/ml/mlruns/820610611326476076/83723a7949674238bc1306e997ba5544/metrics/roc_auc)

### Input Features

The model uses 8 customer-level features:

1. recency_days
2. invoices_count
3. line_items_count
4. quantity_sum
5. monetary
6. average_line_amount
7. tenure_days
8. purchase_rate

Feature list source: [backend/ml/train.py](../backend/ml/train.py#L22) and [backend/app/model_service.py](../backend/app/model_service.py#L11)

### Target Label Logic

Binary target is generated during training:

- positive class if monetary >= 75th percentile
- OR invoices_count >= 75th percentile

Label creation code: [backend/ml/train.py](../backend/ml/train.py#L33)

### Train/Test Setup

- test_size: 0.2
- random_state: 42
- stratified split enabled

Split config: [backend/ml/train.py](../backend/ml/train.py#L49)

### Model Artifacts

- Serialized model path used by API:
  - [backend/ml/artifacts/customer_value_model.joblib](../backend/ml/artifacts/customer_value_model.joblib)
- Runtime config path:
  - [backend/app/config.py](../backend/app/config.py#L11)

## 2. Heuristic Fallback Model (No Artifact Required)

If the trained artifact is missing, API scoring falls back to a rule-based probability function.

- Fallback entry point: [backend/app/model_service.py](../backend/app/model_service.py#L46)
- Decision switch between ML model and heuristic: [backend/app/model_service.py](../backend/app/model_service.py#L56)

Fallback formula:

score = clip(
  0.6 * log1p(monetary) / 8.5
  + 0.35 * invoices_count / 40.0
  - 0.25 * min(recency_days / 365.0, 1.0),
  0.01,
  0.99
)

## 3. MLflow Tracking Summary

- Tracking URI source: [backend/ml/train.py](../backend/ml/train.py#L80)
- Tracking directory: [backend/ml/mlruns](../backend/ml/mlruns)
- Experiment name: crm-customer-value
- Experiment metadata: [backend/ml/mlruns/820610611326476076/meta.yaml](../backend/ml/mlruns/820610611326476076/meta.yaml)

### Logged Runs (Current Repository)

| Run ID | Run Name | Accuracy | F1 | ROC AUC | Metadata |
|---|---|---:|---:|---:|---|
| 2d09c3b95a4444fa87c5bfc9710fcece | logreg-customer-value | 0.958191 | 0.932785 | 0.993703 | [meta.yaml](../backend/ml/mlruns/820610611326476076/2d09c3b95a4444fa87c5bfc9710fcece/meta.yaml) |
| 83723a7949674238bc1306e997ba5544 | logreg-customer-value | 0.958191 | 0.932785 | 0.993703 | [meta.yaml](../backend/ml/mlruns/820610611326476076/83723a7949674238bc1306e997ba5544/meta.yaml) |

Metric files example:

- [backend/ml/mlruns/820610611326476076/83723a7949674238bc1306e997ba5544/metrics/accuracy](../backend/ml/mlruns/820610611326476076/83723a7949674238bc1306e997ba5544/metrics/accuracy)
- [backend/ml/mlruns/820610611326476076/83723a7949674238bc1306e997ba5544/metrics/f1](../backend/ml/mlruns/820610611326476076/83723a7949674238bc1306e997ba5544/metrics/f1)
- [backend/ml/mlruns/820610611326476076/83723a7949674238bc1306e997ba5544/metrics/roc_auc](../backend/ml/mlruns/820610611326476076/83723a7949674238bc1306e997ba5544/metrics/roc_auc)

## 4. Where Prediction Happens in API

- Model loading: [backend/app/model_service.py](../backend/app/model_service.py#L39)
- Probability prediction: [backend/app/model_service.py](../backend/app/model_service.py#L28)
- Segment mapping (high_value vs regular): [backend/app/model_service.py](../backend/app/model_service.py#L65)
