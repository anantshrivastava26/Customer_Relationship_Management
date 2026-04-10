pipeline {
  agent any

  environment {
    PYTHONPATH = "${WORKSPACE}/backend"
  }

  stages {
    stage('Backend Test') {
      steps {
        dir('backend') {
          bat 'python -m pip install -r requirements.txt'
          bat 'python -m compileall app ml'
        }
      }
    }

    stage('Frontend Test') {
      steps {
        dir('frontend') {
          bat 'npm ci'
          bat 'npm run build'
        }
      }
    }

    stage('Train Model') {
      steps {
        dir('backend') {
          bat 'python ml/train.py'
        }
      }
    }
  }
}
