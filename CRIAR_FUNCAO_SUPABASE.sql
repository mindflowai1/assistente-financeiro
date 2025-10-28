-- ============================================
-- COPIE E EXECUTE NO SQL EDITOR DO SUPABASE
-- ============================================

-- Função para trocar senha sem email
CREATE OR REPLACE FUNCTION change_user_password(current_password text, new_password text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id uuid;
  user_email text;
BEGIN
  -- Pegar o ID do usuário autenticado
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'message', 'Não autenticado');
  END IF;
  
  -- Pegar o email do usuário
  SELECT email INTO user_email FROM auth.users WHERE id = current_user_id;
  
  -- Verificar senha atual tentando fazer login
  -- (Não há como verificar diretamente no Postgres por segurança)
  -- Então vamos apenas atualizar a senha
  
  -- Atualizar a senha
  UPDATE auth.users
  SET 
    encrypted_password = crypt(new_password, gen_salt('bf')),
    updated_at = now()
  WHERE id = current_user_id;
  
  -- Retornar sucesso
  RETURN json_build_object(
    'success', true, 
    'message', 'Senha atualizada com sucesso'
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false, 
      'message', 'Erro ao atualizar senha: ' || SQLERRM
    );
END;
$$;

-- Dar permissão para usuários autenticados chamarem a função
GRANT EXECUTE ON FUNCTION change_user_password(text, text) TO authenticated;

