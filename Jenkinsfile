pipeline {
    agent any

    tools {
        nodejs "NodeJS25"
    }

    stages {

        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                sh '''
                    npm install
                    npm audit fix --force || true
                '''
            }
        }

        stage('Clean Old Allure Results') {
            steps {
                sh '''
                    rm -rf allure-results allure-report test-results
                '''
            }
        }

        stage('Install Playwright Browsers') {
            steps {
                sh '''
                    npx playwright install --with-deps
                '''
            }
        }

        stage('Run Playwright Tests (All Specs)') {
            steps {
                sh '''
                    npx playwright test tests --reporter=line,allure-playwright
                '''
            }
        }
    }

    post {
        always {
            archiveArtifacts artifacts: 'allure-results/**', allowEmptyArchive: true
            archiveArtifacts artifacts: 'test-results/**', allowEmptyArchive: true

            allure([
                includeProperties: false,
                jdk: '',
                commandline: 'Allure2',
                results: [[path: 'allure-results']]
            ])
        }
    }
}