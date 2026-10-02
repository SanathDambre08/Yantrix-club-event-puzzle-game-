-- First, deactivate all old questions so we don't delete answers from past tests
UPDATE public.custom_questions SET active = false;

-- Insert the new proper questions
INSERT INTO public.custom_questions (question_text, type, options, required, active, order_index, version)
VALUES 
('What is your current level with robotics?', 'single_choice', ARRAY['Absolute Beginner', 'I have built a few things', 'Advanced'], true, true, 0, 1),
('Which domain do you like in Robotics?', 'multiple_choice', ARRAY['AI & Autonomous Systems', 'Drones & Aeronautics', 'CAD & Mechanical', 'Circuits & Embedded', 'Software & Algorithms'], true, true, 1, 1);
