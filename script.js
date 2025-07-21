document.addEventListener("DOMContentLoaded", () => {
  // 获取DOM元素
  const calculateBtn = document.getElementById("calculate-btn");
  const clearBtn = document.getElementById("clear-btn");
  const resultText = document.getElementById("result-text");
  const resultDistance = document.getElementById("result-distance");

  const inputs = {
    x1: document.getElementById("x1"),
    z1: document.getElementById("z1"),
    angle1: document.getElementById("angle1"),
    x2: document.getElementById("x2"),
    z2: document.getElementById("z2"),
    angle2: document.getElementById("angle2"),
  };

  // 角度转弧度
  const toRadians = (degree) => degree * (Math.PI / 180);

  // 计算功能
  const calculatePosition = () => {
    // 1. 获取并转换所有输入值为浮点数
    const values = {};
    for (const key in inputs) {
      const value = parseFloat(inputs[key].value);
      if (isNaN(value)) {
        resultText.textContent = "错误: 请填写所有6个字段！";
        resultText.style.color = "var(--error-color)";
        resultDistance.textContent = "";
        return;
      }
      values[key] = value;
    }

    const { x1, z1, angle1, x2, z2, angle2 } = values;

    // 2. 将Minecraft角度(Yaw)转换为标准数学角度（弧度）
    // 原理部分指出“Z轴为横轴，X轴为纵轴”，且“顺时针为正”，这与标准数学坐标系不同。
    // 为了避免混淆和简化计算，我们直接使用一个更稳健的方法：
    // 将Minecraft Yaw转换为标准的数学角度（0度在+X轴，逆时针为正）。
    // 转换公式: standard_angle_rad = toRadians(-yaw - 90)
    const alpha_rad = toRadians(-angle1 - 90);
    const beta_rad = toRadians(-angle2 - 90);

    // 3. 计算点O到点P的向量和距离
    const op_dx = x2 - x1;
    const op_dz = z2 - z1;
    const op_length = Math.sqrt(op_dx * op_dx + op_dz * op_dz);

    if (op_length < 1) {
      // 这是修复问题的关键点：移除了字符串中异常的空格/字符。
      resultText.textContent = "错误: 两个投掷点距离太近，请重新选择。";
      resultText.style.color = "var(--error-color)";
      resultDistance.textContent = "";
      return;
    }

    // 4. 计算向量OP的方向角 gamma
    // Math.atan2(y, x) 在这里对应 atan2(dx, dz)，因为X是y轴，Z是x轴
    const gamma_rad = Math.atan2(op_dx, op_dz);

    // 5. 根据正弦定理计算OM的长度
    // 三角形OPM中：
    // 边OP = op_length
    // 角M = |beta_rad - alpha_rad| (两条线的夹角)
    // 角P = |gamma_rad - beta_rad| (OP线与PM线的夹角)
    // OM / sin(P) = OP / sin(M) => OM = OP * sin(P) / sin(M)
    const sin_angle_M = Math.sin(beta_rad - alpha_rad);

    if (Math.abs(sin_angle_M) < 1e-9) {
      resultText.textContent = "错误: 两次投掷方向平行，无法计算交点。";
      resultText.style.color = "var(--error-color)";
      resultDistance.textContent = "";
      return;
    }

    const sin_angle_P = Math.sin(gamma_rad - beta_rad);
    const om_length = (op_length * sin_angle_P) / sin_angle_M;

    // 6. 计算要塞M的坐标
    // 使用标准的极坐标转笛卡尔坐标公式
    // x_M = x_O + r * cos(theta)
    // z_M = z_O + r * sin(theta) -- 注意，在我们的坐标系里，Z是横轴，X是纵轴
    const stronghold_z = z1 + om_length * Math.cos(alpha_rad);
    const stronghold_x = x1 + om_length * Math.sin(alpha_rad);

    // 7. 显示结果
    resultText.textContent = `预测要塞坐标 (X, Z): (${stronghold_x.toFixed(1)}, ${stronghold_z.toFixed(1)})`;
    resultText.style.color = "var(--success-color)";
    resultDistance.textContent = `你距离第一次投掷点(O)约 ${Math.abs(om_length).toFixed(0)} 格。`;
  };

  // 清空功能
  const clearInputs = () => {
    for (const key in inputs) {
      inputs[key].value = "";
    }
    resultText.textContent = "要塞坐标将显示在这里。";
    resultText.style.color = "var(--text-color)";
    resultDistance.textContent = "";
  };

  // 绑定事件
  calculateBtn.addEventListener("click", calculatePosition);
  clearBtn.addEventListener("click", clearInputs);
});
