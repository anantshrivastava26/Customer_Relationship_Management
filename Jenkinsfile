pipeline {
  agent any

  environment {
    PYTHONPATH = "${WORKSPACE}/backend"
  }

  stages {
    stage('Backend Test') {
      steps {
        dir('backend') {
          bat 'py -3 -m pip install -r requirements.txt'
          bat 'py -3 -m compileall app ml'
        }
      }
    }

    stage('Frontend Test') {
      steps {
        dir('frontend') {
          bat 'npm install'
          bat 'npm run build'
        }
      }
    }

    stage('Train Model') {
      steps {
        dir('backend') {
          bat 'py -3 ml/train.py'
        }
      }
    }
  }
}
