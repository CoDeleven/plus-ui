pipeline {
    agent any
    
    tools {
        nodejs 'Node22.16.0'
    }

    environment {
        // 部署信息
        APP_NAME = "admin"
        DEPLOY_SCRIPT = "/opt/ruoyi-web-cicd/scripts/deploy-front.sh"
        KEEP_VERSIONS = "5"
        
        // 构建信息
        BUILD_TIME = new Date().format('yyyyMMdd-HHmmss')
    }
    
    stages {
        // ==================== 拉取代码 ====================
        stage('拉取代码') {
            steps {
                checkout scm
            }
        }
        
        // ==================== 安装依赖 ====================
        stage('安装依赖') {
            steps {
                sh '''
                        # 安装 pnpm
                        npm install -g pnpm
                        
                        # 使用 pnpm 安装
                        pnpm install --registry=https://registry.npmmirror.com
                   '''
            }
        }
        
        // ==================== 构建 ====================
        stage('构建') {
            steps {
                sh 'pnpm run build:prod'
            }
        }
        
        // ==================== 部署 ====================
        stage('部署') {
            steps {
                sh """
                    sudo ${DEPLOY_SCRIPT} ${APP_NAME} dist ${KEEP_VERSIONS}
                """
            }
        }
        
        // ==================== 健康检查 ====================
        stage('健康检查') {
            steps {
                sh '''
                    # 等待 Nginx 生效
                    sleep 2
                    
                    # 检查页面是否可访问
                    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8081)
                    if [ "$HTTP_CODE" != "200" ] && [ "$HTTP_CODE" != "304" ]; then
                        echo "❌ 管理端健康检查失败: HTTP ${HTTP_CODE}"
                        exit 1
                    fi
                    
                    # 检查 API 是否可访问（后端蓝绿网关）
                    API_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8081/prod-api/auth/code)
                    if [ "$API_CODE" != "200" ]; then
                        echo "⚠️ API 健康检查异常: HTTP ${API_CODE}（后端可能正在切换）"
                    else
                        echo "✅ API 正常"
                    fi
                    
                    echo "✅ 管理端部署成功"
                '''
            }
        }
    }
    
    post {
        success {
            echo "✅ 管理端部署完成"
            echo "访问地址: http://localhost:8081"
            echo "部署时间: ${BUILD_TIME}"
        }
        failure {
            echo "❌ 管理端部署失败"
            echo "请检查构建日志"
        }
        always {
            sh 'rm -rf dist'
        }
    }
}