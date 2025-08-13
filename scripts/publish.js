#!/usr/bin/env node

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

// 读取package.json
const packagePath = path.join(__dirname, '../package.json')
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'))

console.log(`准备发布 ${packageJson.name}@${packageJson.version}`)

try {
  // 构建库
  console.log('🔨 构建库文件...')
  execSync('npm run build:lib', { stdio: 'inherit' })
  
  // 检查dist目录是否存在
  const distPath = path.join(__dirname, '../dist')
  if (!fs.existsSync(distPath)) {
    throw new Error('构建失败：dist目录不存在')
  }
  
  console.log('✅ 构建完成')
  
  // 发布到私服
  console.log('📦 发布到私服...')
  execSync('npm publish', { stdio: 'inherit' })
  
  console.log('🎉 发布成功！')
  console.log(`包名: ${packageJson.name}`)
  console.log(`版本: ${packageJson.version}`)
  
} catch (error) {
  console.error('❌ 发布失败:', error.message)
  process.exit(1)
}