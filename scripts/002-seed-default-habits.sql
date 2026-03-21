-- Default Mini-Habits Templates
-- These will be inserted for new users

-- This script creates a function to seed default habits for new users
-- Call this after user registration

-- Example: Seed habits for user with id = 1 (demo user)
-- Run this manually or call seed_user_habits(user_id) after registration

CREATE OR REPLACE FUNCTION seed_user_habits(p_user_id INTEGER) RETURNS VOID AS $$
BEGIN
  -- Morning habits (Ativar o Cérebro)
  INSERT INTO habits (user_id, title, description, phase, is_mini_habit, dopamine_weight, sort_order)
  VALUES 
    (p_user_id, 'Beber água', 'Primeiro copo de água do dia para hidratar o cérebro', 'morning', true, 2, 1),
    (p_user_id, 'Sem soneca', 'Levantar no primeiro alarme - você consegue!', 'morning', true, 3, 2),
    (p_user_id, 'Ver agenda', 'Olhar rapidamente o que tem para hoje', 'morning', true, 2, 3),
    (p_user_id, '1 micro-tarefa', 'Qualquer coisa pequena: arrumar a cama, guardar uma roupa', 'morning', true, 4, 4);

  -- Afternoon habits (Produção Leve)
  INSERT INTO habits (user_id, title, description, phase, is_mini_habit, dopamine_weight, sort_order)
  VALUES 
    (p_user_id, '1 tarefa principal', 'Escolha UMA coisa importante para fazer hoje', 'afternoon', false, 5, 1),
    (p_user_id, 'Regra dos 5 minutos', 'Comece algo por apenas 5 minutos - só começar!', 'afternoon', true, 3, 2),
    (p_user_id, 'Pausa consciente', 'Levante, alongue, respire fundo', 'afternoon', true, 2, 3);

  -- Night habits (Desacelerar)
  INSERT INTO habits (user_id, title, description, phase, is_mini_habit, dopamine_weight, sort_order)
  VALUES 
    (p_user_id, 'Preparar amanhã', 'Deixar uma coisa pronta para amanhã', 'night', true, 3, 1),
    (p_user_id, 'Organizar 1 item', 'Guardar uma coisa no lugar - só uma!', 'night', true, 2, 2),
    (p_user_id, '10 min sem estímulos', 'Sem tela, só descanso antes de dormir', 'night', true, 4, 3);
END;
$$ LANGUAGE plpgsql;
